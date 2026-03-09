/**
 * Quick test script for exhibition pipeline collectors
 * Run: node test-pipeline.js [collector]
 * collectors: aic, koreaCulture, seoulOpenData, mmca, all
 */

require('dotenv').config();

const KoreaCultureCollector = require('./src/services/exhibition-pipeline/collectors/koreaCultureCollector');
const SeoulOpenDataCollector = require('./src/services/exhibition-pipeline/collectors/seoulOpenDataCollector');
const AICExhibitionCollector = require('./src/services/exhibition-pipeline/collectors/aicExhibitionCollector');
const MMCACollector = require('./src/services/exhibition-pipeline/collectors/mmcaCollector');

const target = process.argv[2] || 'aic';

function printSample(results) {
  console.log(`Collected: ${results.length} exhibitions`);
  if (results.length > 0) {
    console.log('\nSample (first 3):');
    results.slice(0, 3).forEach((s, i) => {
      console.log(`  [${i+1}] ${s.title}`);
      console.log(`      Venue: ${s.venue}`);
      console.log(`      Dates: ${s.start_date} ~ ${s.end_date}`);
      console.log(`      Status: ${s.status} | Fee: ${s.admission_fee || '-'}`);
      if (s.metadata?.artists) console.log(`      Artists: ${s.metadata.artists.slice(0, 80)}`);
    });
  }
}

async function test() {
  console.log(`\n=== Testing ${target} collector ===\n`);

  try {
    if (target === 'aic' || target === 'all') {
      console.log('--- Art Institute of Chicago ---');
      const aic = new AICExhibitionCollector();
      const results = await aic.collect();
      printSample(results);
      console.log('');
    }

    if (target === 'mmca' || target === 'all') {
      console.log('--- MMCA (National Museum of Modern and Contemporary Art) ---');
      const mmca = new MMCACollector();
      if (!process.env.KCISA_API_KEY) {
        console.log('SKIPPED: No KCISA_API_KEY set');
      } else {
        // Test with first 3 pages only
        const results = await mmca.collect({ maxPages: 3 });
        printSample(results);
      }
      console.log('');
    }

    if (target === 'koreaCulture' || target === 'all') {
      console.log('--- Korea Culture API ---');
      const kc = new KoreaCultureCollector();
      if (!process.env.KOREA_CULTURE_API_KEY && !process.env.CULTURE_API_KEY) {
        console.log('SKIPPED: No KOREA_CULTURE_API_KEY set');
      } else {
        const results = await kc.collect();
        printSample(results);
      }
      console.log('');
    }

    if (target === 'seoulOpenData' || target === 'all') {
      console.log('--- Seoul Open Data ---');
      const so = new SeoulOpenDataCollector();
      if (!process.env.SEOUL_OPENDATA_API_KEY && !process.env.SEOUL_API_KEY) {
        console.log('SKIPPED: No SEOUL_OPENDATA_API_KEY set');
      } else {
        const results = await so.collect();
        printSample(results);
      }
      console.log('');
    }

    console.log('=== Test complete ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
