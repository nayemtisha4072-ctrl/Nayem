import fs from 'fs';

const txt = await (await fetch('https://formal.jiligamesoft.com/_nuxt/B24ZRiIH.js')).text();

// Search for "lobby"
let pos = 0;
while ((pos = txt.indexOf('lobby', pos)) !== -1) {
  console.log(`=== FOUND "lobby" at ${pos} ===`);
  console.log(txt.slice(Math.max(0, pos - 200), Math.min(txt.length, pos + 300)));
  pos += 10;
}
