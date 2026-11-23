import fs from 'fs';

const res = await fetch('https://formal.jiligamesoft.com/_nuxt/DfcjkwVz.js');
const txt = await res.text();
console.log('DfcjkwVz.js length:', txt.length);

// Let's see how games are structured in DfcjkwVz.js
const games = [...txt.matchAll(/\{game_id:(\d+),game_code:"([^"]+)",game_name_cn:"([^"]+)",game_name_en:"([^"]+)",game_cover_image:([^,]+),game_report_name:"([^"]+)"\}/g)];
console.log('Games in DfcjkwVz.js:', games.length);

// Let's also check how games are launched on formal:
console.log('Mentions of api or start-game or play:');
const matches = [...txt.matchAll(/(?:\/api\/|start-game|openGame|play)[^;,\n]{0,100}/g)].map(m => m[0]);
console.log(matches.slice(0, 15));
