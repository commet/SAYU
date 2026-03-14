#!/usr/bin/env node
/**
 * Collect Seoul Open Data exhibitions and output as JSON file
 * Usage: node collect-seoul-json.js
 */

const http = require('http');

const API_KEY = '466c41627879636c36355152516858';

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function isExhibition(row) {
  const codename = (row.CODENAME || '').toLowerCase();
  const title = (row.TITLE || '').toLowerCase();
  const combined = `${codename} ${title}`;
  const exhibitionCodes = ['전시', '미술', '전시/미술'];
  const exhibitionKeywords = [
    '전시', '미술', '갤러리', '아트', '회화', '조각',
    '사진전', '특별전', '기획전', '설치', 'exhibition', 'art'
  ];
  if (exhibitionCodes.some(code => codename.includes(code))) return true;
  return exhibitionKeywords.some(kw => combined.includes(kw));
}

function calculateStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'upcoming';
  const now = new Date().toISOString().split('T')[0];
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';
  return 'ongoing';
}

async function main() {
  const allExhibitions = [];
  let start = 1;
  const batchSize = 1000;

  while (true) {
    const end = start + batchSize - 1;
    const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/culturalEventInfo/${start}/${end}/`;

    console.error(`Fetching batch ${start}-${end}...`);
    const raw = await fetch(url);
    const parsed = JSON.parse(raw);

    const eventInfo = parsed?.culturalEventInfo;
    if (!eventInfo) break;

    const totalCount = eventInfo.list_total_count || 0;
    const rows = eventInfo.row || [];

    const exhibitions = rows.filter(isExhibition).map(row => {
      const startDate = parseDate(row.STRTDATE);
      const endDate = parseDate(row.END_DATE);
      return {
        external_id: `seoul_${hash(row.TITLE + row.ORG_NAME + (row.STRTDATE || ''))}`,
        title: (row.TITLE || '').trim(),
        venue: (row.ORG_NAME || row.PLACE || '').trim(),
        start_date: startDate,
        end_date: endDate,
        description: (row.PROGRAM || row.ETC_DESC || '').replace(/<[^>]*>/g, '').trim(),
        image_url: (row.MAIN_IMG || '').trim(),
        admission_fee: row.IS_FREE === '무료' ? '무료' : (row.USE_FEE || '').replace(/<[^>]*>/g, '').trim(),
        source_url: row.HMPG_ADDR || '',
        tags: [row.CODENAME, row.GUNAME].filter(Boolean),
        status: calculateStatus(startDate, endDate),
        guname: row.GUNAME || '',
      };
    });

    allExhibitions.push(...exhibitions);
    console.error(`  Got ${exhibitions.length} exhibitions from ${rows.length} events`);

    start += batchSize;
    if (start > totalCount || start > 10000) break;

    await new Promise(r => setTimeout(r, 500));
  }

  console.error(`\nTotal: ${allExhibitions.length} exhibitions`);

  // Output JSON to stdout
  const fs = require('fs');
  fs.writeFileSync('/tmp/seoul-exhibitions.json', JSON.stringify(allExhibitions, null, 2));
  console.error('Written to /tmp/seoul-exhibitions.json');
}

main().catch(e => { console.error(e); process.exit(1); });
