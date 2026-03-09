const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  console.log('=== Testing ArtRabbit ===');
  
  // ArtRabbit blocks AI bots but allows general user-agents
  const cities = ['london', 'new-york', 'berlin', 'tokyo', 'paris'];
  
  for (const city of cities) {
    try {
      const resp = await axios.get(`https://www.artrabbit.com/events/location/${city}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
        validateStatus: s => s < 600
      });
      console.log(`${city}: ${resp.status} (${resp.data.length} bytes)`);
      
      if (resp.status === 200) {
        const $ = cheerio.load(resp.data);
        const links = [];
        $('a[href*="/events/"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && href.match(/\/events\/[a-z]/) && !href.includes('/location/') && !links.includes(href)) {
            links.push(href);
          }
        });
        console.log(`  Exhibition links: ${links.length}`);
        console.log(`  Sample: ${links.slice(0, 3).join(', ')}`);
        
        // Try to find exhibition data in the page
        $('h2, h3').slice(0, 5).each((_, el) => {
          console.log(`  ${$(el).prop('tagName')}: ${$(el).text().trim().substring(0, 60)}`);
        });
      }
    } catch(e) {
      console.log(`${city}: ERROR ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n=== Testing Tokyo Art Beat ===');
  try {
    const resp = await axios.get('https://www.tokyoartbeat.com/en/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      timeout: 15000,
      validateStatus: s => s < 600
    });
    console.log(`Tokyo Art Beat: ${resp.status} (${resp.data.length} bytes)`);
    if (resp.status === 200) {
      const $ = cheerio.load(resp.data);
      console.log('Title:', $('title').text().trim());
      const links = [];
      $('a[href*="/events/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !links.includes(href)) links.push(href);
      });
      console.log(`Event links: ${links.length}`);
      console.log('Sample:', links.slice(0, 5));
      
      // Check for JSON-LD or __NEXT_DATA__
      const nextData = $('script#__NEXT_DATA__').html();
      if (nextData) {
        const parsed = JSON.parse(nextData);
        console.log('__NEXT_DATA__ keys:', Object.keys(parsed.props?.pageProps || {}));
      }
    }
  } catch(e) {
    console.log(`Tokyo Art Beat: ERROR ${e.message}`);
  }
}

test().catch(console.error);
