import fs from 'fs';

const chunks = [
  './TrcFPTNA.js', './DfcjkwVz.js', './BIjgJpnI.js',
  './C5hj6aVG.js', './B0afDKCw.js', './zuyp35S0.js',
  './DTdGRyX5.js', './C0BTKvzb.js', './Bq4TD7op.js',
  './CCKrstST.js', './CcZNw82k.js', './DaZkrHoH.js',
  './Lb_EnZlI.js', './HeN_a6Ok.js', './DC36xft6.js',
  './CmwFLm_N.js', './BeptWCeG.js', './v8k0fTcb.js',
  './BcDFpNKc.js', './DxWJIeKO.js', './BFiQYYDp.js',
  './CY3aOeHB.js', './B4EyP_nK.js', './BiI6EmKf.js',
  './BZ7_YfN8.js', './BosPy_B4.js', './Byzvo9PY.js',
  './DO0CSRdq.js', './CR2AMTtY.js', './CZZFPf9u.js',
  './DWEAQ1kq.js', './LM-2ktWX.js', './D8fQZ4fv.js'
];

async function checkFormal() {
  for (const c of chunks) {
    const fn = c.replace('./', '');
    const url = `https://formal.jiligamesoft.com/_nuxt/${fn}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text.includes('game_code') || text.includes('gameId') || text.includes('game_id') || text.includes('Super Ace') || text.includes('openGame') || text.includes('start-game')) {
          console.log(`=== Formal chunk ${fn} matched! Size: ${text.length} ===`);
          const matches = [...text.matchAll(/(?:game_code|gameId|game_id|openGame|start-game)[^,;]{0,60}/gi)].map(m => m[0]);
          console.log('Matches:', matches.slice(0, 10));
        }
      }
    } catch(e) {
      console.error(c, e.message);
    }
  }
}

checkFormal();
