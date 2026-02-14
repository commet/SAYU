/**
 * e-flux announcements scraper → Supabase source_eflux table
 * Scrapes: https://www.e-flux.com/announcements/
 * Strategy: Paginate listing, then scrape individual pages for rich data
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

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

function parseDate(text) {
  if (!text) return null;
  text = text.trim();

  // "February 13 – May 31, 2026" or "February 13, 2026 – May 31, 2026"
  const rangeMatch = text.match(
    /(\w+)\s+(\d{1,2}),?\s*(\d{4})?\s*[-–—]\s*(\w+)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (rangeMatch) {
    const sm = MONTHS[rangeMatch[1].toLowerCase()];
    const em = MONTHS[rangeMatch[4].toLowerCase()];
    if (sm && em) {
      const endYear = rangeMatch[6];
      const startYear = rangeMatch[3] || endYear;
      return {
        start: `${startYear}-${sm}-${rangeMatch[2].padStart(2, '0')}`,
        end: `${endYear}-${em}-${rangeMatch[5].padStart(2, '0')}`
      };
    }
  }

  // European: "13 February – 31 May 2026" or "13 February 2026 – 31 May 2026"
  const euMatch = text.match(
    /(\d{1,2})\s+(\w+)\s*(\d{4})?\s*[-–—]\s*(\d{1,2})\s+(\w+)\s+(\d{4})/i
  );
  if (euMatch) {
    const sm = MONTHS[euMatch[2].toLowerCase()];
    const em = MONTHS[euMatch[5].toLowerCase()];
    if (sm && em) {
      const endYear = euMatch[6];
      const startYear = euMatch[3] || endYear;
      return {
        start: `${startYear}-${sm}-${euMatch[1].padStart(2, '0')}`,
        end: `${endYear}-${em}-${euMatch[4].padStart(2, '0')}`
      };
    }
  }

  // Single date: "February 13, 2026"
  const singleMatch = text.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (singleMatch) {
    const m = MONTHS[singleMatch[1].toLowerCase()];
    if (m) return { start: `${singleMatch[3]}-${m}-${singleMatch[2].padStart(2, '0')}`, end: null };
  }

  return null;
}

// Extract city from venue/location text
function extractCity(text) {
  if (!text) return null;
  const cities = [
    'New York', 'Los Angeles', 'London', 'Paris', 'Berlin', 'Tokyo', 'Seoul',
    'Shanghai', 'Hong Kong', 'Rome', 'Milan', 'Amsterdam', 'Brussels', 'Vienna',
    'Zurich', 'Basel', 'Geneva', 'Dubai', 'São Paulo', 'Mexico City', 'Sydney',
    'Melbourne', 'Mumbai', 'Beijing', 'Singapore', 'Istanbul', 'Athens', 'Barcelona',
    'Madrid', 'Lisbon', 'Copenhagen', 'Stockholm', 'Oslo', 'Helsinki', 'Prague',
    'Warsaw', 'Budapest', 'Chicago', 'San Francisco', 'Miami', 'Houston',
    'Philadelphia', 'Boston', 'Washington', 'Toronto', 'Montreal', 'Vancouver',
    'Taipei', 'Bangkok', 'Jakarta', 'Manila', 'Dhaka', 'Riyadh', 'Doha',
    'Abu Dhabi', 'Cape Town', 'Johannesburg', 'Lagos', 'Nairobi', 'Cairo'
  ];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return null;
}

// Scrape announcement listing pages to get URLs
async function getAnnouncementLinks(maxPages = 20) {
  console.log('\n--- Collecting e-flux announcement links ---');
  const allLinks = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? 'https://www.e-flux.com/announcements/'
      : `https://www.e-flux.com/announcements/?page=${page}`;

    console.log(`  Fetching page ${page}...`);
    try {
      const resp = await axios.get(url, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        timeout: 15000
      });

      const $ = cheerio.load(resp.data);
      const pageLinks = [];

      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.match(/\/announcements\/\d+\//) && !allLinks.includes(href) && !pageLinks.includes(href)) {
          pageLinks.push(href);
        }
      });

      if (pageLinks.length === 0) {
        console.log(`  Page ${page}: no links found, stopping`);
        break;
      }

      allLinks.push(...pageLinks);
      console.log(`  Page ${page}: ${pageLinks.length} links (total: ${allLinks.length})`);

      await delay(2000); // Respectful crawl delay
    } catch (e) {
      console.log(`  Page ${page} error: ${e.message}`);
      break;
    }
  }

  return allLinks;
}

// Scrape individual announcement page for rich data
async function scrapeAnnouncement(url) {
  const fullUrl = url.startsWith('http') ? url : `https://www.e-flux.com${url}`;

  const resp = await axios.get(fullUrl, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html' },
    timeout: 15000
  });

  const $ = cheerio.load(resp.data);

  // Extract metadata
  const title = $('meta[property="og:title"]').attr('content')?.replace(/ - Announcements - e-flux$/, '').trim()
    || $('h1').first().text().trim();
  const description = $('meta[property="og:description"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || null;

  // Extract article body text for dates, venue, city
  const articleText = $('article').text() || $('body').text();
  const bodyText = articleText.substring(0, 5000);

  // Try to find dates in the article text
  let dates = null;
  // Common patterns in e-flux:
  // "February 13 – May 31, 2026"
  const datePatterns = [
    /(\w+\s+\d{1,2},?\s+\d{4}\s*[-–—]\s*\w+\s+\d{1,2},?\s+\d{4})/i,
    /(\w+\s+\d{1,2}\s*[-–—]\s*\w+\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}\s+\w+\s+\d{4}\s*[-–—]\s*\d{1,2}\s+\w+\s+\d{4})/i,
    /(\d{1,2}\s+\w+\s*[-–—]\s*\d{1,2}\s+\w+\s+\d{4})/i,
  ];
  for (const pat of datePatterns) {
    const match = bodyText.match(pat);
    if (match) {
      dates = parseDate(match[1]);
      if (dates) break;
    }
  }

  // Extract subjects/participants from the page's metadata
  const subjects = [];
  const participants = [];
  // e-flux puts metadata like "Subject: ...", "Participants: ..." in the sidebar
  $('a[href*="/participants/"], a[href*="/p/"]').each((_, el) => {
    const name = $(el).text().trim();
    if (name.length > 1 && name.length < 80) participants.push(name);
  });
  $('a[href*="/subjects/"], a[href*="/s/"]').each((_, el) => {
    const name = $(el).text().trim();
    if (name.length > 1 && name.length < 80) subjects.push(name);
  });

  // Extract institution/venue
  let venue = null;
  $('a[href*="/institutions/"], a[href*="/i/"]').each((_, el) => {
    if (!venue) venue = $(el).text().trim();
  });

  // Try to find city
  const city = extractCity(bodyText) || extractCity(venue || '');

  // Extract ID from URL
  const idMatch = url.match(/\/announcements\/(\d+)/);
  const externalId = idMatch ? idMatch[1] : url.replace(/[^a-zA-Z0-9]/g, '-');

  return {
    external_id: externalId,
    title: title || '',
    venue: venue,
    city: city,
    start_date: dates?.start || null,
    end_date: dates?.end || null,
    description: description || null,
    image_url: image,
    artists: participants.length > 0 ? participants : null,
    subjects: subjects.length > 0 ? subjects : null,
    source_url: fullUrl,
    raw_data: {
      title, venue, city, dates,
      participants: participants.slice(0, 20),
      subjects: subjects.slice(0, 20)
    }
  };
}

async function run() {
  console.log('=== e-flux Announcements Scraper ===\n');

  // 1. Check table
  console.log('1. Checking source_eflux table...');
  const { error: testErr } = await supabase.from('source_eflux').select('id').limit(1);
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  Table does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log(`CREATE TABLE IF NOT EXISTS source_eflux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  venue TEXT,
  city TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  image_url TEXT,
  artists TEXT[],
  subjects TEXT[],
  source_url TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_source_eflux_dates ON source_eflux(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_source_eflux_city ON source_eflux(city);`);
    return;
  }
  console.log('  Table ready');

  // 2. Collect announcement links
  const links = await getAnnouncementLinks(15); // ~15 pages = ~225 announcements
  console.log(`\n  Total links collected: ${links.length}`);

  if (links.length === 0) {
    console.log('\n  No links found. Done.');
    return;
  }

  // 3. Scrape individual pages
  console.log('\n3. Scraping individual announcements...');
  const results = [];
  let scraped = 0;

  for (const link of links) {
    try {
      const data = await scrapeAnnouncement(link);
      if (data.title) {
        results.push(data);
        scraped++;
        console.log(`  [${scraped}/${links.length}] ${data.title.substring(0, 60)} | ${data.city || '?'} | ${data.start_date || 'no date'}`);
      }
      await delay(2000); // 2s crawl delay
    } catch (e) {
      console.log(`  Error scraping ${link}: ${e.message}`);
    }
  }

  console.log(`\n  Scraped: ${results.length} announcements`);

  if (results.length === 0) {
    console.log('\n  No results. Done.');
    return;
  }

  // 4. Upsert to Supabase
  console.log('\n4. Syncing to Supabase...');
  let inserted = 0, errors = 0;
  const batchSize = 30;

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize).map(r => ({
      ...r,
      collected_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('source_eflux')
      .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.log(`  Batch error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += (data?.length || 0);
    }
  }

  console.log(`\n  Results: ${inserted} upserted, ${errors} errors`);

  // 5. Verify
  const { count } = await supabase.from('source_eflux').select('id', { count: 'exact', head: true });
  console.log(`\n5. Total records in source_eflux: ${count}`);
  console.log('\n=== Done ===');
}

run().catch(console.error);
