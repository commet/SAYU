require('dotenv').config();
const https = require('https');

const key = process.env.KCISA_CULTURE_API_KEY;

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => res.statusCode < 300 ? resolve(d) : reject(new Error(`HTTP ${res.statusCode}: ${d.slice(0,200)}`)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function test() {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      console.log(`Attempt ${attempt}...`);
      const url = `https://api.kcisa.kr/openapi/CNV_060/request?serviceKey=${encodeURIComponent(key)}&numOfRows=3&pageNo=1&dtype=${encodeURIComponent('전시')}&title=${encodeURIComponent('전시')}`;
      const data = await fetch(url);
      console.log('Success!\n');
      console.log(data.slice(0, 3000));
      return;
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
      if (attempt < 4) await new Promise(r => setTimeout(r, attempt * 3000));
    }
  }
}
test();
