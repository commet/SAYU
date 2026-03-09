const axios = require('axios');
const cheerio = require('cheerio');

async function testOcula() {
  console.log('=== Testing Ocula access methods ===\n');

  const approaches = [
    // Try different paths and methods
    { url: 'https://ocula.com/art-exhibitions/', name: 'Main exhibitions' },
    { url: 'https://ocula.com/art-exhibitions/exhibitions-in-paris/', name: 'Paris exhibitions' },
    { url: 'https://ocula.com/cities/', name: 'Cities list' },
    { url: 'https://ocula.com/sitemap.xml', name: 'Sitemap' },
    { url: 'https://ocula.com/robots.txt', name: 'Robots.txt' },
    // Try JSON API patterns
    { url: 'https://ocula.com/api/exhibitions', name: 'API exhibitions' },
    { url: 'https://ocula.com/graphql', name: 'GraphQL' },
  ];

  for (const { url, name } of approaches) {
    try {
      const resp = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: s => s < 600
      });
      console.log(`${name}: ${resp.status} (${String(resp.data).length} bytes)`);
      if (resp.status === 200 && String(resp.data).length < 2000) {
        console.log('  Content:', String(resp.data).substring(0, 500));
      }
    } catch (e) {
      console.log(`${name}: ERROR ${e.response?.status || e.message}`);
    }
  }
}

testOcula().catch(e => console.log('Error:', e.message));
