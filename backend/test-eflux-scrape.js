const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeEflux() {
  console.log('=== Testing e-flux scraping approaches ===\n');

  // Approach 1: Scrape the announcements listing page
  console.log('1. Fetching announcements listing page...');
  const resp = await axios.get('https://www.e-flux.com/announcements/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    timeout: 15000
  });

  const html = resp.data;
  console.log('  Page length:', html.length);

  const $ = cheerio.load(html);

  // Find announcement links
  const links = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.match(/\/announcements\/\d+/) && !links.includes(href)) {
      links.push(href);
    }
  });
  console.log('  Announcement links found:', links.length);
  console.log('  Sample:', links.slice(0, 5));

  // Look for embedded JSON data
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    if (text.includes('"title"') && text.includes('"institution"') && text.length > 200) {
      console.log('\n  Found JSON-like script (first 500):', text.substring(0, 500));
    }
  });

  // Approach 2: Try a specific known announcement page
  if (links.length > 0) {
    console.log('\n2. Fetching individual announcement...');
    const pageUrl = links[0].startsWith('http') ? links[0] : `https://www.e-flux.com${links[0]}`;
    console.log('  URL:', pageUrl);

    const pageResp = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      timeout: 15000
    });

    const page$ = cheerio.load(pageResp.data);
    console.log('  Page length:', pageResp.data.length);

    // Extract structured data
    const title = page$('h1').first().text().trim();
    console.log('  Title (h1):', title);

    const ogTitle = page$('meta[property="og:title"]').attr('content');
    console.log('  OG Title:', ogTitle);

    const ogDescription = page$('meta[property="og:description"]').attr('content');
    console.log('  OG Description:', ogDescription?.substring(0, 200));

    const ogImage = page$('meta[property="og:image"]').attr('content');
    console.log('  OG Image:', ogImage);

    // Look for structured data (JSON-LD)
    page$('script[type="application/ld+json"]').each((i, el) => {
      const text = page$(el).html();
      console.log('\n  JSON-LD found:', text?.substring(0, 500));
    });

    // Look for article content
    const articleText = page$('article').first().text().trim();
    console.log('  Article text length:', articleText.length);
    console.log('  Article preview:', articleText.substring(0, 200));
  }

  // Approach 3: Try the sitemap
  console.log('\n3. Checking sitemap...');
  try {
    const sitemapResp = await axios.get('https://www.e-flux.com/sitemap.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
      validateStatus: s => s < 500
    });
    console.log('  Sitemap status:', sitemapResp.status);
    console.log('  Sitemap preview:', String(sitemapResp.data).substring(0, 500));
  } catch (e) {
    console.log('  Sitemap error:', e.message);
  }
}

scrapeEflux().catch(e => console.log('Error:', e.message));
