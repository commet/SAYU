require('dotenv').config();
const https = require('https');

const key = process.env.KCISA_API_KEY;
console.log('Key:', key);

// Try with longer timeout and URL-encoded key
const encodedKey = encodeURIComponent(key);
const url = `https://api.kcisa.kr/openapi/service/rest/moca/docMeta?serviceKey=${encodedKey}&numOfRows=3&pageNo=1`;
console.log('URL:', url);
console.log('\nFetching...');

const req = https.get(url, { timeout: 30000 }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    console.log('\nResponse:');
    console.log(data.slice(0, 3000));
  });
});
req.on('error', e => console.error('Error:', e.message));
req.on('timeout', () => { console.log('TIMEOUT'); req.destroy(); });
