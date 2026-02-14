/**
 * Korean private gallery exhibition scraper → Supabase source_galleries table
 * Scrapes: Kukje, PKM, Ropac, Lehmann Maupin, Pace, ARTMAP, Neolook
 */
require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchPage(url, options = {}) {
  const resp = await axios.get(url, {
    timeout: options.timeout || 20000,
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...options.headers
    },
    maxRedirects: 5,
    validateStatus: s => s < 400
  });
  return resp.data;
}

// ─── Date parsing helper ───────────────────────────────────────────────

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

function parseDate(text) {
  if (!text || typeof text !== 'string') return null;
  text = text.trim();

  // ISO format: 2025-12-09
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (iso) return { start: iso[1], end: null };

  // English full range: "December 9, 2025 - February 15, 2026"
  const enRange = text.match(
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})\s*[-–—~]\s*(\w+)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (enRange) {
    const sm = MONTHS[enRange[1].toLowerCase()];
    const em = MONTHS[enRange[4].toLowerCase()];
    if (sm && em) {
      return {
        start: `${enRange[3]}-${sm}-${enRange[2].padStart(2, '0')}`,
        end: `${enRange[6]}-${em}-${enRange[5].padStart(2, '0')}`
      };
    }
  }

  // English single-year range: "February 4 – March 21, 2026" or "Jan 16 – Feb 28, 2026"
  const enSingleYearRange = text.match(
    /(\w+)\s+(\d{1,2})\s*[-–—~]\s*(\w+)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (enSingleYearRange) {
    const sm = MONTHS[enSingleYearRange[1].toLowerCase()];
    const em = MONTHS[enSingleYearRange[3].toLowerCase()];
    if (sm && em) {
      const year = enSingleYearRange[5];
      // If start month > end month, start year is previous year
      const startYear = parseInt(sm) > parseInt(em) ? String(parseInt(year) - 1) : year;
      return {
        start: `${startYear}-${sm}-${enSingleYearRange[2].padStart(2, '0')}`,
        end: `${year}-${em}-${enSingleYearRange[4].padStart(2, '0')}`
      };
    }
  }

  // European date range: "21 November 2025—7 February 2026" (Day Month Year—Day Month Year)
  const euRange = text.match(
    /(\d{1,2})\s+(\w+)\s+(\d{4})\s*[-–—~]\s*(\d{1,2})\s+(\w+)\s+(\d{4})/i
  );
  if (euRange) {
    const sm = MONTHS[euRange[2].toLowerCase()];
    const em = MONTHS[euRange[5].toLowerCase()];
    if (sm && em) {
      return {
        start: `${euRange[3]}-${sm}-${euRange[1].padStart(2, '0')}`,
        end: `${euRange[6]}-${em}-${euRange[4].padStart(2, '0')}`
      };
    }
  }

  // European single-year range: "22 January—28 February 2026" (Day Month—Day Month Year)
  const euSingleYearRange = text.match(
    /(\d{1,2})\s+(\w+)\s*[-–—~]\s*(\d{1,2})\s+(\w+)\s+(\d{4})/i
  );
  if (euSingleYearRange) {
    const sm = MONTHS[euSingleYearRange[2].toLowerCase()];
    const em = MONTHS[euSingleYearRange[4].toLowerCase()];
    if (sm && em) {
      const year = euSingleYearRange[5];
      const startYear = parseInt(sm) > parseInt(em) ? String(parseInt(year) - 1) : year;
      return {
        start: `${startYear}-${sm}-${euSingleYearRange[1].padStart(2, '0')}`,
        end: `${year}-${em}-${euSingleYearRange[3].padStart(2, '0')}`
      };
    }
  }

  // English single date: "December 9, 2025"
  const enSingle = text.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (enSingle) {
    const m = MONTHS[enSingle[1].toLowerCase()];
    if (m) return { start: `${enSingle[3]}-${m}-${enSingle[2].padStart(2, '0')}`, end: null };
  }

  // Neolook: "2025_1209 ▶ 2026_0215"
  const neo = text.match(/(\d{4})_(\d{2})(\d{2})\s*[▶►→>]\s*(\d{4})_(\d{2})(\d{2})/);
  if (neo) {
    return {
      start: `${neo[1]}-${neo[2]}-${neo[3]}`,
      end: `${neo[4]}-${neo[5]}-${neo[6]}`
    };
  }

  // Korean dot: "2025.12.09 - 2026.02.15" or "2025.12.09 ~ 2026.02.15"
  const dot = text.match(/(\d{4})[./](\d{1,2})[./](\d{1,2})\s*[-–—~]\s*(\d{4})[./](\d{1,2})[./](\d{1,2})/);
  if (dot) {
    return {
      start: `${dot[1]}-${dot[2].padStart(2, '0')}-${dot[3].padStart(2, '0')}`,
      end: `${dot[4]}-${dot[5].padStart(2, '0')}-${dot[6].padStart(2, '0')}`
    };
  }

  // Korean dot single: "2025.12.09"
  const dotSingle = text.match(/(\d{4})[./](\d{1,2})[./](\d{1,2})/);
  if (dotSingle) {
    return {
      start: `${dotSingle[1]}-${dotSingle[2].padStart(2, '0')}-${dotSingle[3].padStart(2, '0')}`,
      end: null
    };
  }

  // ISO range: "2025-12-09 - 2026-02-15"
  const isoRange = text.match(/(\d{4}-\d{2}-\d{2})\s*[-–—~]\s*(\d{4}-\d{2}-\d{2})/);
  if (isoRange) {
    return { start: isoRange[1], end: isoRange[2] };
  }

  return null;
}

// Helper: check if text looks like a date string
function looksLikeDate(text) {
  if (!text) return false;
  text = text.trim();
  // Check common date patterns
  return /^\w+\s+\d{1,2}\s*[-–—~]/.test(text) ||       // "February 4 – ..."
         /^\d{1,2}\s+\w+\s*[-–—~]/.test(text) ||       // "21 November—..."
         /^\d{4}[./]\d/.test(text) ||                     // "2025.12.09..."
         /^\w+\s+\d{1,2},?\s+\d{4}/.test(text);          // "December 9, 2025"
}

function cleanText(t) {
  return (t || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

// ─── 1. Kukje Gallery (국제갤러리) ────────────────────────────────────────

async function scrapeKukje() {
  console.log('\n--- Scraping Kukje Gallery ---');
  const results = [];

  // Kukje is JS-rendered - cheerio can't extract much. Limit range to save time.
  for (let seq = 270; seq <= 300; seq++) {
    try {
      await delay(3000);
      const url = `https://www.kukjegallery.com/exhibitions/view?seq=${seq}`;
      let html;
      try {
        html = await fetchPage(url);
      } catch (e) {
        if (e.response && e.response.status >= 400) continue;
        continue;
      }

      const $ = cheerio.load(html);

      // Kukje's <title> is: "Exhibition Title | KUKJE GALLERY" or "Artist - Title | KUKJE GALLERY"
      const pageTitle = $('title').text().trim();
      const titlePart = pageTitle.split('|')[0].trim().split(' - KUKJE')[0].trim();

      // Skip if just "KUKJE GALLERY" (no exhibition loaded)
      if (!titlePart || titlePart === 'KUKJE GALLERY' || titlePart.length < 3) continue;

      // Artist from link to /artists/view
      const artist = $('a[href*="/artists/view"]').first().text().trim() || null;

      // Title: if artist is found, title might be separate; otherwise use titlePart
      let title = titlePart;
      if (artist && titlePart.startsWith(artist)) {
        title = titlePart.slice(artist.length).replace(/^[\s\-–:]+/, '').trim() || titlePart;
      }
      if (!title || title.length < 2) title = titlePart;

      // Dates: look for date patterns in page text
      const bodyText = $.text();
      const dateMatch = bodyText.match(
        /(\w+)\s+(\d{1,2}),?\s+(\d{4})\s*[-–—]\s*(\w+)\s+(\d{1,2}),?\s+(\d{4})/i
      );
      const dates = dateMatch ? parseDate(dateMatch[0]) : null;

      // Image: look for /upload/exhibitions/ paths
      let imageUrl = null;
      $('img[src*="/upload/exhibitions/"]').each((_, el) => {
        if (!imageUrl) {
          const src = $(el).attr('src');
          imageUrl = src?.startsWith('http') ? src : `https://www.kukjegallery.com${src}`;
        }
      });
      if (!imageUrl) imageUrl = $('meta[property="og:image"]').attr('content') || null;

      results.push({
        gallery_slug: 'kukje',
        external_id: `seq-${seq}`,
        title,
        artist,
        venue_name: '국제갤러리 Kukje Gallery',
        venue_address: '서울특별시 종로구 삼청로 54',
        start_date: dates?.start || null,
        end_date: dates?.end || null,
        description: null,
        image_url: imageUrl,
        source_url: url,
        medium: null,
        exhibition_type: 'gallery',
        raw_data: { seq, pageTitle, title, artist, dateText: dateMatch?.[0] || '' }
      });
      console.log(`  [${seq}] ${artist ? artist + ' - ' : ''}${title}`);
    } catch (e) {
      // Skip failed pages silently
    }
  }

  console.log(`  Kukje: ${results.length} exhibitions found`);
  return results;
}

// ─── 2. PKM Gallery ──────────────────────────────────────────────────────

async function scrapePKM() {
  console.log('\n--- Scraping PKM Gallery ---');
  const results = [];

  try {
    const listHtml = await fetchPage('https://www.pkmgallery.com/exhibitions');
    const $list = cheerio.load(listHtml);

    // PKM structure: <a> with <img>, <h3> (may be date OR title), other text
    // If h3 is a date, the title is in non-h3 text
    const seen = new Set();
    $list('a[href*="/exhibitions/"]').each((_, el) => {
      const $a = $list(el);
      const href = $a.attr('href');
      if (!href || href === '/exhibitions' || href === '/exhibitions/' || seen.has(href)) return;
      if (href.includes('/past/') || href.includes('/past') || href.includes('view-all')) return;
      seen.add(href);

      const imgSrc = $a.find('img').first().attr('src') || null;
      if (!imgSrc) return;

      const h3Text = $a.find('h3').first().text().trim();
      const h4Text = $a.find('h4').first().text().trim();
      const fullText = $a.text().trim();

      let title = '';
      let dateText = '';
      let remainingText = '';

      // Key fix: check if h3 IS a date string
      if (looksLikeDate(h3Text)) {
        dateText = h3Text;
        remainingText = fullText.replace(h3Text, '').trim();
        if (h4Text) remainingText = remainingText.replace(h4Text, '').trim();
        title = remainingText;
      } else {
        title = h3Text;
        remainingText = fullText.replace(h3Text, '');
        if (h4Text) remainingText = remainingText.replace(h4Text, '');
        remainingText = remainingText.trim();
        const dateMatch = remainingText.match(
          /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}\s*[-–—~]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}/i
        );
        if (dateMatch) dateText = dateMatch[0];
      }

      if (!title || title.length < 2) return;
      if (h4Text && !title.includes(h4Text)) title = `${title} - ${h4Text}`;
      const artist = looksLikeDate(h3Text) ? null : h3Text;
      const dates = parseDate(dateText);
      const slug = href.replace(/^\/exhibitions\//, '').replace(/\/$/, '');

      results.push({
        gallery_slug: 'pkm',
        external_id: slug,
        title,
        artist,
        venue_name: 'PKM Gallery',
        venue_address: '서울특별시 종로구 삼청로 75',
        start_date: dates?.start || null,
        end_date: dates?.end || null,
        description: null,
        image_url: imgSrc,
        source_url: `https://www.pkmgallery.com${href}`,
        medium: null,
        exhibition_type: 'gallery',
        raw_data: { slug, h3Text, h4Text, dateText, remainingText: remainingText.substring(0, 200) }
      });
      console.log(`  ${title} | ${dateText || 'no date'}`);
    });
  } catch (e) {
    console.log(`  PKM scraper error: ${e.message}`);
  }

  console.log(`  PKM: ${results.length} exhibitions found`);
  return results;
}

// ─── 3. Thaddaeus Ropac Seoul ─────────────────────────────────────────────

async function scrapeRopac() {
  console.log('\n--- Scraping Thaddaeus Ropac Seoul ---');
  const results = [];

  try {
    const listHtml = await fetchPage('https://ropac.net/exhibitions/search/?filter=1&selected_locations=8');
    const $list = cheerio.load(listHtml);

    const seen = new Set();
    $list('a[href*="/exhibitions/"]').each((_, el) => {
      const $a = $list(el);
      const href = $a.attr('href');
      if (!href || href.includes('/search') || seen.has(href)) return;
      if (!/\/exhibitions\/\d+-/.test(href)) return;
      seen.add(href);

      // Ropac structure: h3[0]=artist, h3[1]=title, then text nodes for dates and location
      const h3s = $a.find('h3');
      const artist = h3s.eq(0).text().trim() || '';
      const exhibTitle = h3s.length > 1 ? h3s.eq(1).text().trim() : '';

      if (!artist && !exhibTitle) return;
      const title = exhibTitle || artist;

      // Get all text from the anchor, remove h3 content, look for date patterns
      const fullText = $a.text();
      // Remove h3 texts to isolate remaining text (dates, location)
      let remainingText = fullText;
      h3s.each((_, h) => {
        remainingText = remainingText.replace($list(h).text().trim(), '');
      });
      remainingText = remainingText.replace(/\s+/g, ' ').trim();

      // Also check p tags and spans
      const pTexts = [];
      $a.find('p, span').each((_, p) => {
        const t = $list(p).text().trim();
        if (t) pTexts.push(t);
      });

      // Try to find date in remaining text or p tags
      let dateText = '';
      const allTexts = [remainingText, ...pTexts];
      for (const t of allTexts) {
        if (parseDate(t)) { dateText = t; break; }
        // Also check substrings - date might be mixed with location text
        const dateMatch = t.match(/\d{1,2}\s+\w+\s+\d{4}\s*[—–-]\s*\d{1,2}\s+\w+\s+\d{4}/i) ||
                          t.match(/\d{1,2}\s+\w+\s*[—–-]\s*\d{1,2}\s+\w+\s+\d{4}/i);
        if (dateMatch) { dateText = dateMatch[0]; break; }
      }

      const dates = parseDate(dateText);

      // Try to find location
      let location = '';
      for (const t of allTexts) {
        if (t.toLowerCase().includes('seoul') || t.toLowerCase().includes('paris') ||
            t.toLowerCase().includes('london') || t.toLowerCase().includes('salzburg')) {
          location = t;
          break;
        }
      }

      const slug = href.replace(/^\/exhibitions\//, '').replace(/\/$/, '');

      results.push({
        gallery_slug: 'ropac',
        external_id: slug,
        title,
        artist: artist || null,
        venue_name: 'Thaddaeus Ropac Seoul',
        venue_address: '서울특별시 용산구 한남대로 118',
        start_date: dates?.start || null,
        end_date: dates?.end || null,
        description: null,
        image_url: null,
        source_url: `https://ropac.net${href}`,
        medium: null,
        exhibition_type: 'gallery',
        raw_data: { slug, artist, title: exhibTitle, dateText, location, remainingText: remainingText.substring(0, 200) }
      });
      console.log(`  ${artist ? artist + ' - ' : ''}${exhibTitle} | ${dateText || 'no date'}`);
    });
  } catch (e) {
    console.log(`  Ropac scraper error: ${e.message}`);
  }

  console.log(`  Ropac: ${results.length} exhibitions found`);
  return results;
}

// ─── 4. Lehmann Maupin Seoul ──────────────────────────────────────────────

async function scrapeLehmann() {
  console.log('\n--- Scraping Lehmann Maupin Seoul ---');
  const results = [];

  // Actual structure (verified):
  // <a href="/exhibitions/[slug]"> with text: "TitleArtistLocationDates"
  // h2 = artist/subtitle, h3 = dates, NO p tags
  // "Seoul" is a text node between h2 and h3
  const listUrls = [
    'https://www.lehmannmaupin.com/exhibitions',
    'https://www.lehmannmaupin.com/exhibitions/past/seoul'
  ];

  try {
    for (const listUrl of listUrls) {
      try {
        await delay(3000);
        const listHtml = await fetchPage(listUrl);
        const $ = cheerio.load(listHtml);

        const seen = new Set();
        $('a[href*="/exhibitions/"]').each((_, el) => {
          const $a = $(el);
          const href = $a.attr('href');
          if (!href || href.endsWith('/current') || href.endsWith('/past') ||
              href.includes('/past/') || href.endsWith('/upcoming') ||
              href === '/exhibitions' || href === '/exhibitions/' ||
              seen.has(href)) return;
          seen.add(href);

          const fullText = $a.text().trim();
          if (!fullText || fullText.length < 3) return;

          const h2 = $a.find('h2').first().text().trim(); // artist/subtitle
          const h3 = $a.find('h3').first().text().trim(); // dates
          const imgSrc = $a.find('img').first().attr('src') || null;

          // Title: extract from full text by removing h2, h3, and known location words
          let remaining = fullText;
          if (h2) remaining = remaining.replace(h2, '|||');
          if (h3) remaining = remaining.replace(h3, '|||');
          const parts = remaining.split('|||').map(p => p.trim()).filter(p => p.length > 0);

          // Title is usually the first non-location, non-date part
          let title = '';
          let location = '';
          for (const p of parts) {
            const lower = p.toLowerCase();
            if (lower === 'seoul' || lower === 'new york' || lower === 'london' ||
                lower === 'hong kong' || lower === 'upcoming' || lower === 'past') {
              location = p;
            } else if (p.length >= 2 && !title) {
              title = p;
            }
          }

          if (!title || title.length < 2) {
            // Fallback: use the first significant text before h2
            const idx = fullText.indexOf(h2);
            if (idx > 2) {
              title = fullText.substring(0, idx).trim();
            }
          }
          if (!title || title.length < 2) return;

          const artist = h2 || null;
          let dateText = h3 || '';
          // If h3 is empty, search fullText for date patterns
          if (!dateText) {
            const dateMatch = fullText.match(
              /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[-–—~]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
            ) || fullText.match(
              /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*[-–—~]\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i
            );
            if (dateMatch) dateText = dateMatch[0];
          }
          const dates = parseDate(dateText);

          // Check Seoul: from text nodes or from URL
          const isSeoul = listUrl.includes('seoul') ||
            fullText.toLowerCase().includes('seoul') ||
            fullText.includes('서울');
          if (!listUrl.includes('seoul') && !isSeoul) return;

          const slug = href.replace(/^\/exhibitions\//, '').replace(/\/$/, '');

          results.push({
            gallery_slug: 'lehmann_maupin',
            external_id: slug,
            title,
            artist,
            venue_name: 'Lehmann Maupin Seoul',
            venue_address: '서울특별시 종로구 삼청로 122',
            start_date: dates?.start || null,
            end_date: dates?.end || null,
            description: null,
            image_url: imgSrc,
            source_url: `https://www.lehmannmaupin.com${href}`,
            medium: null,
            exhibition_type: 'gallery',
            raw_data: { slug, title, artist: h2, dateText, location, fullText: fullText.substring(0, 200) }
          });
          console.log(`  ${title} (${artist || '?'}) | ${dateText || 'no date'}`);
        });

        console.log(`  ${listUrl}: processed`);
      } catch (e) {
        console.log(`  Error fetching ${listUrl}: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  Lehmann Maupin scraper error: ${e.message}`);
  }

  console.log(`  Lehmann Maupin: ${results.length} exhibitions found`);
  return results;
}

// ─── 5. Pace Gallery Seoul ────────────────────────────────────────────────

async function scrapePace() {
  console.log('\n--- Scraping Pace Gallery Seoul ---');
  const results = [];

  try {
    const listHtml = await fetchPage('https://www.pacegallery.com/exhibitions/');
    const $list = cheerio.load(listHtml);

    // Pace organizes by city sections. Find all exhibition links and their context.
    // Strategy: get all text content from the page, find Seoul section links
    const allLinks = [];
    const seen = new Set();

    $list('a[href*="/exhibitions/"]').each((_, el) => {
      const $a = $list(el);
      const href = $a.attr('href');
      if (!href || href === '/exhibitions/' || href.endsWith('/exhibitions') || seen.has(href)) return;
      seen.add(href);

      // Get nearby text context - check parent and sibling elements
      const $parent = $a.parent();
      const contextText = $parent.text() || '';
      const linkText = $a.text().trim();

      // Get h3 inside or near the link
      const h3 = $a.find('h3').first().text().trim() || '';
      const imgSrc = $a.find('img').first().attr('src') ||
                     $a.find('img').first().attr('data-src') || null;

      allLinks.push({ href, h3, linkText, contextText, imgSrc });
    });

    console.log(`  Found ${allLinks.length} exhibition links total`);

    // Now fetch detail pages only for links that seem Seoul-related
    // First pass: check if "Seoul" appears near the link context
    const seoulLinks = [];
    for (const link of allLinks) {
      const ctx = (link.contextText + ' ' + link.linkText).toLowerCase();
      if (ctx.includes('seoul') || ctx.includes('서울')) {
        seoulLinks.push(link);
      }
    }
    console.log(`  ${seoulLinks.length} links with Seoul context`);

    // If Seoul context detection failed, try all links via detail pages (limited)
    const linksToCheck = seoulLinks.length > 0 ? seoulLinks : allLinks.slice(0, 20);

    for (const link of linksToCheck) {
      try {
        await delay(2000);
        const url = link.href.startsWith('http') ? link.href : `https://www.pacegallery.com${link.href}`;
        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        // Check if Seoul
        const bodyText = $.text().toLowerCase();
        if (!bodyText.includes('seoul') && !bodyText.includes('서울')) continue;

        // Title: try og:title first (more reliable), then h1
        let title = $('meta[property="og:title"]').attr('content') || '';
        if (title.toLowerCase() === 'exhibitions' || !title) {
          title = $('h1').first().text().trim();
        }
        // Clean "| Pace Gallery" suffix
        title = title.replace(/\s*\|\s*Pace\s*Gallery.*/i, '').trim();
        if (!title || title.length < 2 || title.toLowerCase() === 'exhibitions') continue;

        // Artist: try multiple selectors
        const artist = link.h3 || $('h2').first().text().trim() || null;

        // Dates: look for date text in various places
        let dateText = '';
        const dateSelectors = ['.exhibition-date', '.date', '.dates', 'time', '[class*="date"]', '[class*="Date"]'];
        for (const sel of dateSelectors) {
          const t = $(sel).first().text().trim();
          if (t && parseDate(t)) { dateText = t; break; }
        }
        // Fallback: search page text for date patterns
        if (!dateText) {
          const allText = $.text();
          const dateMatch = allText.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}\s*[-–—~]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}/i) ||
                            allText.match(/\w+\s+\d{1,2},?\s+\d{4}\s*[-–—~]\s*\w+\s+\d{1,2},?\s+\d{4}/i);
          if (dateMatch) dateText = dateMatch[0];
        }

        const dates = parseDate(dateText);
        const imageUrl = $('meta[property="og:image"]').attr('content') || link.imgSrc || null;
        const slug = link.href.replace(/^\/exhibitions\//, '').replace(/\/$/, '');

        results.push({
          gallery_slug: 'pace',
          external_id: slug,
          title,
          artist: artist !== title ? artist : null,
          venue_name: 'Pace Gallery Seoul',
          venue_address: '서울특별시 용산구 이태원로 262',
          start_date: dates?.start || null,
          end_date: dates?.end || null,
          description: null,
          image_url: imageUrl,
          source_url: url,
          medium: null,
          exhibition_type: 'gallery',
          raw_data: { slug, title, artist, dateText }
        });
        console.log(`  ${title} | ${dateText || 'no date'}`);
      } catch (e) {
        // Skip failed pages
      }
    }
  } catch (e) {
    console.log(`  Pace scraper error: ${e.message}`);
  }

  console.log(`  Pace: ${results.length} exhibitions found`);
  return results;
}

// ─── 6. Korean ARTMAP (art-map.co.kr) ─────────────────────────────────────

async function scrapeArtmapKR() {
  console.log('\n--- Scraping ARTMAP (art-map.co.kr) ---');
  const results = [];

  try {
    // ARTMAP loads data via AJAX POST to /data/new_exhibition.php
    // `start` is the offset, returns 4 items per request
    const batchSize = 4;
    for (let start = 0; start < 500; start += batchSize) {
      await delay(1500);
      const page = Math.floor(start / batchSize) + 1;
      console.log(`  Fetching ARTMAP offset ${start} (page ${page})...`);

      let html;
      try {
        const resp = await axios.post('https://art-map.co.kr/data/new_exhibition.php',
          `start=${start}&wrap=1&type=&area=&cate=&od=&v_cnt=&online=`,
          {
            timeout: 20000,
            headers: {
              'User-Agent': UA,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Referer': 'https://art-map.co.kr/exhibition/new_list.php',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }
        );
        html = resp.data;
      } catch (e) {
        console.log(`  ARTMAP page ${wrap} error: ${e.message}`);
        continue;
      }

      if (!html || html.trim().length < 50) {
        console.log(`  ARTMAP offset ${start}: empty response, stopping`);
        break;
      }

      const $ = cheerio.load(html);

      // ARTMAP structure (verified):
      // <div class='new_exh_list'>
      //   <span id='ttl_N'>Title</span><br/>
      //   <span>Venue/City</span><br/>
      //   <span>YYYY.MM.DD ~ YYYY.MM.DD</span>
      //   <span class='mck'><input type='checkbox' id='mapcID' onclick='push_val("title", lat, lng, id, "venue", galleryId, "imgUrl")'></span>
      // </div>
      const items = $('.new_exh_list').toArray();
      if (items.length === 0) {
        console.log(`  ARTMAP offset ${start}: no items found, stopping`);
        break;
      }

      let pageCount = 0;
      for (const item of items) {
        const $item = $(item);

        // Title: span with id starting with 'ttl_'
        const title = $item.find('span[id^="ttl_"]').text().trim();
        if (!title || title.length < 2) continue;

        // Get non-hidden spans (exclude .mck) for venue and dates
        const visibleSpans = [];
        $item.find('span').each((_, s) => {
          const $s = $(s);
          if (!$s.hasClass('mck') && !$s.attr('id')?.startsWith('ttl_')) {
            visibleSpans.push($s.text().trim());
          }
        });

        // Venue is first visible span (format: "Gallery/City")
        const venue = visibleSpans[0] || null;
        // Date is second visible span (format: "2026.02.20 ~ 2026.03.14")
        const dateText = visibleSpans[1] || '';
        const dates = parseDate(dateText);

        // Extract ID and coordinates from checkbox onclick
        const checkbox = $item.find('input[type="checkbox"]').attr('id') || '';
        const extId = checkbox.replace('mapc', '');
        const onclick = $item.find('input[type="checkbox"]').attr('onclick') || '';
        // push_val("title", lat, lng, id, "venue", galleryId, "imgUrl")
        const coordMatch = onclick.match(/push_val\([^,]+,\s*([\d.]+),\s*([\d.]+),\s*(\d+)/);
        const lat = coordMatch ? parseFloat(coordMatch[1]) : null;
        const lng = coordMatch ? parseFloat(coordMatch[2]) : null;

        // Image: from the link's img
        const imgSrc = $item.closest('a').find('img').attr('src') ||
                        $item.parent().find('img').first().attr('src') || null;

        // Extract link href
        const linkHref = $item.closest('a').attr('href') || $item.parent().closest('a').attr('href') || '';
        const fullUrl = linkHref ? `https://art-map.co.kr/exhibition/${linkHref}` : 'https://art-map.co.kr';

        if (!extId) continue;

        results.push({
          gallery_slug: 'artmap_kr',
          external_id: String(extId),
          title: cleanText(title),
          artist: null,
          venue_name: venue || null,
          venue_address: null,
          start_date: dates?.start || null,
          end_date: dates?.end || null,
          description: null,
          image_url: imgSrc || null,
          source_url: fullUrl,
          medium: null,
          exhibition_type: 'mixed',
          raw_data: { title, venue, dateText, lat, lng }
        });
        pageCount++;
      }
      console.log(`  ARTMAP offset ${start}: ${pageCount} items parsed`);
    }
  } catch (e) {
    console.log(`  ARTMAP scraper error: ${e.message}`);
  }

  console.log(`  ARTMAP: ${results.length} exhibitions found`);
  return results;
}

// ─── 7. Neolook.com ──────────────────────────────────────────────────────

async function scrapeNeolook() {
  console.log('\n--- Scraping Neolook ---');
  const results = [];

  // Current month + previous month
  const now = new Date();
  const months = [];
  months.push(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  months.push(`${prev.getFullYear()}${String(prev.getMonth() + 1).padStart(2, '0')}`);

  try {
    for (const ym of months) {
      try {
        await delay(5000); // Extra respectful - robots.txt blocks /archives/
        const url = `https://neolook.com/archives/${ym}`;
        console.log(`  Fetching ${url}...`);

        const html = await fetchPage(url, { timeout: 30000 });
        const $ = cheerio.load(html);

        // Find exhibition entries
        const entries = $('article, .archive-item, .post, .entry, .exhibition-item, li.exhibition').toArray();

        // Fallback: look for links to individual exhibition pages
        if (entries.length === 0) {
          const links = [];
          $('a[href*="neolook.com/archives/"]').each((_, el) => {
            const href = $(el).attr('href');
            // Individual exhibition pages have numeric IDs after archives/
            if (href && /\/archives\/\d{8,}/.test(href)) {
              if (!links.includes(href)) links.push(href);
            }
          });

          console.log(`  ${ym}: found ${links.length} exhibition links`);

          for (const link of links.slice(0, 30)) {
            try {
              await delay(5000); // Respectful delay
              const exHtml = await fetchPage(link, { timeout: 30000 });
              const $ex = cheerio.load(exHtml);

              const title = $ex('h1, .entry-title, .post-title, article h2').first().text().trim()
                || $ex('meta[property="og:title"]').attr('content') || '';
              if (!title || title.length < 2) continue;

              const bodyText = $ex('article, .entry-content, .post-content, .content').first().text();

              // Extract artist - often near the title
              const artist = $ex('.artist, .author-name').first().text().trim() || null;

              // Extract dates (Neolook format: YYYY_MMDD ▶ YYYY_MMDD)
              const neoDateMatch = bodyText.match(/(\d{4}_\d{4})\s*[▶►→>]\s*(\d{4}_\d{4})/);
              let dates = null;
              if (neoDateMatch) {
                dates = parseDate(`${neoDateMatch[1]} ▶ ${neoDateMatch[2]}`);
              } else {
                // Try other date patterns in text
                const altDate = bodyText.match(/\d{4}[./]\d{1,2}[./]\d{1,2}\s*[-–~]\s*\d{4}[./]\d{1,2}[./]\d{1,2}/);
                if (altDate) dates = parseDate(altDate[0]);
              }

              const venue = $ex('.venue, .gallery-name, .location').first().text().trim() || null;
              const medium = $ex('.medium, .category').first().text().trim() || null;

              const extId = link.match(/\/archives\/(\d+)/)?.[1] || link.replace(/[^a-zA-Z0-9]/g, '-');

              results.push({
                gallery_slug: 'neolook',
                external_id: String(extId),
                title: cleanText(title),
                artist,
                venue_name: venue,
                venue_address: null,
                start_date: dates?.start || null,
                end_date: dates?.end || null,
                description: cleanText(bodyText)?.slice(0, 5000) || null,
                image_url: $ex('meta[property="og:image"]').attr('content')
                  || $ex('article img, .entry-content img').first().attr('src') || null,
                source_url: link,
                medium,
                exhibition_type: 'mixed',
                raw_data: { url: link, title, venue, dateText: neoDateMatch?.[0] || '' }
              });
              console.log(`  ${title}`);
            } catch (e) {
              console.log(`  Error scraping ${link}: ${e.message}`);
            }
          }
          continue;
        }

        // Process entries from listing page directly
        let count = 0;
        for (const el of entries) {
          const $el = $(el);
          const title = $el.find('h2, h3, .title, a').first().text().trim();
          if (!title || title.length < 2) continue;

          const link = $el.find('a').first().attr('href') || '';
          const dateText = $el.find('.date, .period, time').first().text().trim();
          const dates = parseDate(dateText);
          const venue = $el.find('.venue, .gallery, .location').first().text().trim() || null;
          const img = $el.find('img').first().attr('src');

          const extId = link.match(/\/archives\/(\d+)/)?.[1] || `neolook-${ym}-${count}`;

          results.push({
            gallery_slug: 'neolook',
            external_id: String(extId),
            title: cleanText(title),
            artist: null,
            venue_name: venue,
            venue_address: null,
            start_date: dates?.start || null,
            end_date: dates?.end || null,
            description: null,
            image_url: img || null,
            source_url: link.startsWith('http') ? link : (link ? `https://neolook.com${link}` : url),
            medium: null,
            exhibition_type: 'mixed',
            raw_data: { title, link, venue, dateText }
          });
          count++;
        }
        console.log(`  ${ym}: ${count} exhibitions from listing`);
      } catch (e) {
        console.log(`  ${ym} error: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  Neolook scraper error: ${e.message}`);
  }

  console.log(`  Neolook: ${results.length} exhibitions found`);
  return results;
}

// ─── 8. Gagosian (worldwide) ──────────────────────────────────────────────

async function scrapeGagosian() {
  console.log('\n--- Scraping Gagosian ---');
  const results = [];

  try {
    const html = await fetchPage('https://gagosian.com/exhibitions/');
    const $ = cheerio.load(html);

    // Gagosian uses Next.js SSR with JSON data. Look for exhibition links.
    const seen = new Set();
    $('a[href*="/exhibitions/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      if (!href || href === '/exhibitions/' || href === '/exhibitions/archive/' || seen.has(href)) return;
      if (!/\/exhibitions\/[a-z0-9-]+/.test(href)) return;
      seen.add(href);

      const h4 = $a.find('h4').first().text().trim();
      const fullText = $a.text().trim();
      const imgSrc = $a.find('img').first().attr('src') || null;

      // Extract title, artist, dates from text
      let title = h4 || '';
      if (!title) return;

      // Try to find dates in fullText
      let dateText = '';
      const dateMatch = fullText.match(
        /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[–—-]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
      ) || fullText.match(
        /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\s*[–—-]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
      );
      if (dateMatch) dateText = dateMatch[0];
      const dates = parseDate(dateText);

      // Try to find location
      let location = '';
      const locMatch = fullText.match(/(?:New York|Los Angeles|London|Paris|Rome|Hong Kong|Geneva|Athens|Basel)/i);
      if (locMatch) location = locMatch[0];

      const slug = href.replace(/^\/exhibitions\//, '').replace(/\/$/, '');
      const fullUrl = `https://gagosian.com${href}`;

      results.push({
        gallery_slug: 'gagosian',
        external_id: slug,
        title,
        artist: null,
        venue_name: location ? `Gagosian ${location}` : 'Gagosian',
        venue_address: null,
        start_date: dates?.start || null,
        end_date: dates?.end || null,
        description: null,
        image_url: imgSrc,
        source_url: fullUrl,
        medium: null,
        exhibition_type: 'gallery',
        raw_data: { slug, title, dateText, location }
      });
      console.log(`  ${title} | ${location || '?'} | ${dateText || 'no date'}`);
    });
  } catch (e) {
    console.log(`  Gagosian scraper error: ${e.message}`);
  }

  console.log(`  Gagosian: ${results.length} exhibitions found`);
  return results;
}

// ─── 9. Perrotin (worldwide) ─────────────────────────────────────────────

async function scrapePerrotin() {
  console.log('\n--- Scraping Perrotin ---');
  const results = [];

  try {
    const html = await fetchPage('https://www.perrotin.com/exhibitions');
    const $ = cheerio.load(html);

    // Perrotin embeds Schema.org JSON-LD for each exhibition
    const seen = new Set();
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json['@type'] !== 'Event' || !json.name) return;
        const key = `${json.name}_${json.startDate}`;
        if (seen.has(key)) return;
        seen.add(key);

        const artists = (json.performer || []).map(p => p.name).filter(Boolean);
        const loc = json.location || {};
        const placeName = loc.name || '';
        const address = loc.address || '';

        results.push({
          gallery_slug: 'perrotin',
          external_id: `${json.name}_${json.startDate}`.replace(/\s+/g, '_').substring(0, 100),
          title: json.name,
          artist: artists.join(', ') || null,
          venue_name: placeName && !placeName.toLowerCase().startsWith('perrotin') ? `Perrotin ${placeName}` : (placeName || 'Perrotin'),
          venue_address: address || null,
          start_date: json.startDate || null,
          end_date: json.endDate || null,
          description: json.description || null,
          image_url: (json.image ? (Array.isArray(json.image) ? json.image[0] : json.image) : null),
          source_url: json.url || 'https://www.perrotin.com/exhibitions',
          medium: null,
          exhibition_type: 'gallery',
          raw_data: { jsonld: true, artists, location: placeName }
        });
        console.log(`  ${json.name} | ${placeName || '?'} | ${json.startDate || 'no date'}`);
      } catch (_) {}
    });

    // Fallback: parse HTML cards if no JSON-LD found
    if (results.length === 0) {
      console.log('  No JSON-LD found, trying HTML parsing...');
      // Structure: h3=location, h4=artist, h3=title, p=dates
      $('h3, h4').each((_, el) => {
        const text = $(el).text().trim();
        if (text) console.log(`  Found ${el.tagName}: ${text.substring(0, 60)}`);
      });
    }
  } catch (e) {
    console.log(`  Perrotin scraper error: ${e.message}`);
  }

  console.log(`  Perrotin: ${results.length} exhibitions found`);
  return results;
}

// ─── 10. Lisson Gallery (worldwide) ──────────────────────────────────────

async function scrapeLisson() {
  console.log('\n--- Scraping Lisson Gallery ---');
  const results = [];

  try {
    const html = await fetchPage('https://www.lissongallery.com/exhibitions');
    const $ = cheerio.load(html);

    // Lisson has TWO <a> tags per exhibition: first=image, second=text
    // Group by href, merge image + text data
    const byHref = {};
    $('a[href*="/exhibitions/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      if (!href || href === '/exhibitions' || href === '/exhibitions/' ||
          href.includes('/year/')) return;

      if (!byHref[href]) byHref[href] = { img: null, imgAlt: null, text: '' };
      const imgEl = $a.find('img').first();
      if (imgEl.length) {
        byHref[href].img = imgEl.attr('src') || imgEl.attr('data-src') || null;
        byHref[href].imgAlt = imgEl.attr('alt') || null;
      }
      const text = $a.text().replace(/\s+/g, ' ').trim();
      if (text.length > byHref[href].text.length) byHref[href].text = text;
    });

    for (const [href, data] of Object.entries(byHref)) {
      const fullText = data.text;
      if (!fullText || fullText.length < 3) continue;

      // Dates: "11 February – 11 April 2026" or "11 February 2026 – 11 April 2026"
      let dateText = '';
      const dateMatch = fullText.match(
        /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*[–—-]\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i
      ) || fullText.match(
        /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*[–—-]\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i
      );
      if (dateMatch) dateText = dateMatch[0];
      const dates = parseDate(dateText);

      let location = '';
      const locMatch = fullText.match(/(?:London|New York|Shanghai|Beijing|East Hampton)/i);
      if (locMatch) location = locMatch[0];

      let title = fullText;
      if (dateText) title = title.replace(dateText, '');
      if (location) title = title.replace(location, '');
      title = title.replace(/\s+/g, ' ').trim();
      if (!title || title.length < 2) continue;

      const slug = href.replace(/^\/exhibitions\//, '').replace(/\/$/, '');

      results.push({
        gallery_slug: 'lisson',
        external_id: slug,
        title,
        artist: data.imgAlt || null,
        venue_name: location ? `Lisson Gallery ${location}` : 'Lisson Gallery',
        venue_address: null,
        start_date: dates?.start || null,
        end_date: dates?.end || null,
        description: null,
        image_url: data.img,
        source_url: `https://www.lissongallery.com${href}`,
        medium: null,
        exhibition_type: 'gallery',
        raw_data: { slug, title, dateText, location, imgAlt: data.imgAlt }
      });
      console.log(`  ${title.substring(0, 50)} | ${location || '?'} | ${dateText || 'no date'}`);
    }
  } catch (e) {
    console.log(`  Lisson scraper error: ${e.message}`);
  }

  console.log(`  Lisson: ${results.length} exhibitions found`);
  return results;
}

// ─── 11. Sprüth Magers (worldwide) ──────────────────────────────────────

async function scrapeSpruthMagers() {
  console.log('\n--- Scraping Sprüth Magers ---');
  const results = [];

  try {
    const html = await fetchPage('https://spruethmagers.com/exhibitions/');
    const $ = cheerio.load(html);

    // Sprüth Magers has TWO <a> tags per exhibition: first=image, second=text
    // Group by href, merge image + text data
    const byHref = {};
    $('a[href*="exhibitions"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href') || '';
      const slugMatch = href.match(/\/exhibitions\/([a-zA-Z0-9][\w-]+[^/])\/?$/);
      if (!slugMatch) return;
      const slug = slugMatch[1];
      if (slug === 'upcoming' || slug === 'past') return;

      if (!byHref[href]) byHref[href] = { slug, img: null, imgAlt: null, text: '' };
      const imgEl = $a.find('img').first();
      if (imgEl.length) {
        byHref[href].img = imgEl.attr('src') || null;
        byHref[href].imgAlt = imgEl.attr('alt') || null;
      }
      const text = $a.text().replace(/\s+/g, ' ').trim();
      if (text.length > byHref[href].text.length) byHref[href].text = text;
    });

    for (const [href, data] of Object.entries(byHref)) {
      const fullText = data.text;
      // Parse from text content OR img alt (format: "Artist – Title – Location")
      const altParts = (data.imgAlt || '').split(/\s*[–—-]\s*/);

      let artist = null, exhibTitle = '', location = '';

      if (fullText && fullText.length > 5) {
        // Text link has: "ArtistTitleDate Location Description..."
        // Try to extract date first
        let dateText = '';
        const dateMatch = fullText.match(
          /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[–—-]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
        ) || fullText.match(
          /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\s*[–—-]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
        );
        if (dateMatch) dateText = dateMatch[0];
        const dates = parseDate(dateText);

        const locMatch = fullText.match(/(?:Berlin|London|Los Angeles|Seoul|New York)/i);
        if (locMatch) location = locMatch[0];

        // Use alt text for structured artist/title
        if (altParts.length >= 2) {
          artist = altParts[0].trim();
          exhibTitle = altParts.length >= 3 ? altParts[1].trim() : '';
          if (!location && altParts.length >= 3) location = altParts[altParts.length - 1].trim();
        }

        const title = exhibTitle || artist || data.slug.replace(/-/g, ' ');

        results.push({
          gallery_slug: 'spruth_magers',
          external_id: data.slug,
          title: artist && exhibTitle ? `${artist} - ${exhibTitle}` : title,
          artist,
          venue_name: location ? `Sprüth Magers ${location}` : 'Sprüth Magers',
          venue_address: null,
          start_date: dates?.start || null,
          end_date: dates?.end || null,
          description: null,
          image_url: data.img,
          source_url: href,
          medium: null,
          exhibition_type: 'gallery',
          raw_data: { slug: data.slug, artist, title: exhibTitle, dateText, location }
        });
        console.log(`  ${artist || ''} - ${exhibTitle || '?'} | ${location || '?'} | ${dateText || 'no date'}`);
      } else if (altParts.length >= 2) {
        // Fallback: parse from img alt only
        artist = altParts[0].trim();
        exhibTitle = altParts.length >= 3 ? altParts[1].trim() : '';
        location = altParts[altParts.length - 1].trim();

        results.push({
          gallery_slug: 'spruth_magers',
          external_id: data.slug,
          title: artist && exhibTitle ? `${artist} - ${exhibTitle}` : artist,
          artist,
          venue_name: location ? `Sprüth Magers ${location}` : 'Sprüth Magers',
          venue_address: null,
          start_date: null,
          end_date: null,
          description: null,
          image_url: data.img,
          source_url: href,
          medium: null,
          exhibition_type: 'gallery',
          raw_data: { slug: data.slug, artist, title: exhibTitle, location, fromAlt: true }
        });
        console.log(`  ${artist} - ${exhibTitle || '?'} | ${location || '?'} | (from alt)`);
      }
    }
  } catch (e) {
    console.log(`  Sprüth Magers scraper error: ${e.message}`);
  }

  console.log(`  Sprüth Magers: ${results.length} exhibitions found`);
  return results;
}

// ─── 12. Arario Gallery (Seoul/Shanghai/Cheonan) ─────────────────────────

async function scrapeArario() {
  console.log('\n--- Scraping Arario Gallery ---');
  const results = [];

  try {
    const html = await fetchPage('https://www.arariogallery.com/exhibitions/');
    const $ = cheerio.load(html);

    const seen = new Set();
    $('a[href*="/exhibitions/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      if (!href || href === '/exhibitions/' || href.includes('/archive/') || seen.has(href)) return;
      seen.add(href);

      const fullText = $a.text().trim();
      const imgSrc = $a.find('img').first().attr('src') || null;
      if (!fullText || fullText.length < 3) return;

      // Date patterns
      let dateText = '';
      const dateMatch = fullText.match(
        /(\d{1,2})\s+(\w+)\s+(\d{4})\s*[-–—]\s*(\d{1,2})\s+(\w+)\s+(\d{4})/i
      ) || fullText.match(
        /(\d{1,2})\s+(\w+)\s*[-–—]\s*(\d{1,2})\s+(\w+)\s+(\d{4})/i
      );
      if (dateMatch) dateText = dateMatch[0];
      const dates = parseDate(dateText);

      let location = '';
      const locMatch = fullText.match(/(?:Seoul|Shanghai|Cheonan)/i);
      if (locMatch) location = locMatch[0];

      // Title: remove date/location/type from text
      let title = fullText;
      if (dateText) title = title.replace(dateText, '');
      if (location) title = title.replace(new RegExp(location, 'i'), '');
      title = title.replace(/(?:SOLO|GROUP)\s+EXHIBITION/i, '').replace(/\s+/g, ' ').trim();
      if (!title || title.length < 2) return;

      const slug = href.replace(/^.*\/exhibitions\//, '').replace(/\/$/, '');

      results.push({
        gallery_slug: 'arario',
        external_id: slug,
        title,
        artist: null,
        venue_name: location ? `Arario Gallery ${location}` : 'Arario Gallery',
        venue_address: location === 'Seoul' ? '서울특별시 종로구 북촌로5길 84' : null,
        start_date: dates?.start || null,
        end_date: dates?.end || null,
        description: null,
        image_url: imgSrc,
        source_url: href.startsWith('http') ? href : `https://www.arariogallery.com${href}`,
        medium: null,
        exhibition_type: 'gallery',
        raw_data: { slug, title, dateText, location }
      });
      console.log(`  ${title.substring(0, 50)} | ${location || '?'} | ${dateText || 'no date'}`);
    });
  } catch (e) {
    console.log(`  Arario scraper error: ${e.message}`);
  }

  console.log(`  Arario: ${results.length} exhibitions found`);
  return results;
}

// ─── Main run function ────────────────────────────────────────────────────

async function run() {
  console.log('=== Gallery Scraper Sync ===\n');

  // 1. Check table
  console.log('1. Checking source_galleries table...');
  const { error: testErr } = await supabase.from('source_galleries').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE source_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_slug TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  venue_name TEXT,
  venue_address TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  medium TEXT,
  exhibition_type TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_slug, external_id)
);
CREATE INDEX idx_source_galleries_slug ON source_galleries(gallery_slug);
CREATE INDEX idx_source_galleries_dates ON source_galleries(start_date, end_date);`);
    return;
  }
  console.log('  Table ready');

  // 2. Scrape all galleries
  console.log('\n2. Scraping galleries...');
  const allResults = [];
  const stats = {};

  const scrapers = [
    { name: 'Kukje', fn: scrapeKukje },
    { name: 'PKM', fn: scrapePKM },
    { name: 'Ropac', fn: scrapeRopac },
    { name: 'Lehmann Maupin', fn: scrapeLehmann },
    { name: 'Pace', fn: scrapePace },
    { name: 'ARTMAP', fn: scrapeArtmapKR },
    { name: 'Neolook', fn: scrapeNeolook },
    { name: 'Gagosian', fn: scrapeGagosian },
    { name: 'Perrotin', fn: scrapePerrotin },
    { name: 'Lisson', fn: scrapeLisson },
    { name: 'Sprüth Magers', fn: scrapeSpruthMagers },
    { name: 'Arario', fn: scrapeArario }
  ];

  for (const scraper of scrapers) {
    try {
      const items = await scraper.fn();
      stats[scraper.name] = items.length;
      allResults.push(...items);
    } catch (e) {
      console.log(`\n  ${scraper.name} FAILED: ${e.message}`);
      stats[scraper.name] = 0;
    }
  }

  console.log(`\n  Total collected: ${allResults.length} exhibitions`);
  console.log('  Per gallery:', stats);

  if (allResults.length === 0) {
    console.log('\n  No data collected. Done.');
    return;
  }

  // Deduplicate by gallery_slug + external_id (keep last occurrence)
  const deduped = new Map();
  for (const item of allResults) {
    const key = `${item.gallery_slug}::${item.external_id}`;
    deduped.set(key, item);
  }
  const uniqueResults = [...deduped.values()];
  console.log(`  After dedup: ${uniqueResults.length} unique exhibitions`);

  // 3. Upsert to Supabase
  console.log('\n3. Syncing to Supabase...');
  let inserted = 0, errors = 0;

  const batchSize = 30;
  for (let i = 0; i < uniqueResults.length; i += batchSize) {
    const batch = uniqueResults.slice(i, i + batchSize);
    const rows = batch.map(item => ({
      gallery_slug: item.gallery_slug,
      external_id: item.external_id,
      title: item.title,
      artist: item.artist || null,
      venue_name: item.venue_name || null,
      venue_address: item.venue_address || null,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      description: item.description || null,
      image_url: item.image_url || null,
      source_url: item.source_url || null,
      medium: item.medium || null,
      exhibition_type: item.exhibition_type || null,
      raw_data: item.raw_data || {},
      collected_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('source_galleries')
      .upsert(rows, { onConflict: 'gallery_slug,external_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.log(`  Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += (data?.length || 0);
    }
  }

  console.log(`\n  Results: ${inserted} upserted, ${errors} errors`);

  // 4. Verify
  const { count } = await supabase.from('source_galleries').select('id', { count: 'exact', head: true });
  const { data: bySrc } = await supabase.from('source_galleries').select('gallery_slug');

  const slugCounts = {};
  (bySrc || []).forEach(r => { slugCounts[r.gallery_slug] = (slugCounts[r.gallery_slug] || 0) + 1; });

  console.log(`\n4. Verification: ${count} total records in source_galleries`);
  console.log('  By gallery:', slugCounts);

  const { data: sample } = await supabase
    .from('source_galleries')
    .select('title, gallery_slug, venue_name, start_date, end_date, image_url')
    .not('start_date', 'is', null)
    .order('start_date', { ascending: false })
    .limit(5);

  if (sample) {
    console.log('  Recent exhibitions:');
    sample.forEach(e => console.log(`  - [${e.gallery_slug}] ${e.title} @ ${e.venue_name || '?'} (${e.start_date}~${e.end_date}) img:${e.image_url ? 'Y' : 'N'}`));
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);
