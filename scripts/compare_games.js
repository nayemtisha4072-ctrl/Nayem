import fs from 'fs';

// Compare games in demo vs games in formal
const demoGames = JSON.parse(fs.readFileSync('scripts/jili_games_extracted.json', 'utf8'));

// Now extract all games from formal chunk DfcjkwVz.js
const formalTxt = await (await fetch('https://formal.jiligamesoft.com/_nuxt/DfcjkwVz.js')).text();

// Find array of games in formal
// Pattern {game_id:...,game_code:"...",game_name_cn:"...",game_name_en:"..."...}
const regex = /\{game_id:(\d+),game_code:"([^"]+)",game_name_cn:"([^"]+)",game_name_en:"([^"]+)",game_cover_image:([^,]+),game_report_name:"([^"]+)"\}/g;
let m;
const formalGames = [];
while ((m = regex.exec(formalTxt)) !== null) {
  formalGames.push({
    game_id: parseInt(m[1]),
    game_code: m[2],
    game_name_cn: m[3],
    game_name_en: m[4],
    game_report_name: m[6]
  });
}

console.log('Demo games count:', demoGames.length);
console.log('Formal games count:', formalGames.length);

const demoCodes = new Set(demoGames.map(g => g.game_code));
const formalCodes = new Set(formalGames.map(g => g.game_code));

const inFormalNotDemo = formalGames.filter(g => !demoCodes.has(g.game_code));
const inDemoNotFormal = demoGames.filter(g => !formalCodes.has(g.game_code));

console.log('In Formal but not in Demo:', inFormalNotDemo);
console.log('In Demo but not in Formal:', inDemoNotFormal);
