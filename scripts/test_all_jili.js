import fs from 'fs';

const games = JSON.parse(fs.readFileSync('scripts/jili_games_extracted.json', 'utf8'));

async function testAll() {
  const results = [];
  console.log(`Starting test for ${games.length} JILI games...`);
  
  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    try {
      const res = await fetch('https://demo.jiligamesoft.com/api/demo/start-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://demo.jiligamesoft.com/',
          'Origin': 'https://demo.jiligamesoft.com'
        },
        body: JSON.stringify({
          ot: 'vince_test',
          user_code: 'demo_' + Math.random().toString(36).slice(2, 10),
          game_code: g.game_code,
          lang: 'en-US'
        })
      });
      const data = await res.json();
      if (data && data.code === 0 && data.data && data.data.url) {
        results.push({ ...g, success: true, url: data.data.url });
        console.log(`[${i+1}/${games.length}] OK: ${g.game_code} - ${g.game_name_en}`);
      } else {
        results.push({ ...g, success: false, error: data?.message || 'Failed' });
        console.log(`[${i+1}/${games.length}] FAIL: ${g.game_code} - ${g.game_name_en} (${data?.message})`);
      }
    } catch (e) {
      results.push({ ...g, success: false, error: e.message });
      console.log(`[${i+1}/${games.length}] ERROR: ${g.game_code} - ${g.game_name_en} (${e.message})`);
    }
    // slight delay to be polite
    await new Promise(r => setTimeout(r, 80));
  }

  const successful = results.filter(r => r.success);
  console.log(`\nTesting completed: ${successful.length} / ${games.length} games have active live demo API endpoints!`);
  fs.writeFileSync('scripts/jili_demo_test_results.json', JSON.stringify(results, null, 2));
}

testAll();
