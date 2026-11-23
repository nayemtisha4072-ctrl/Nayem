import fs from 'fs';

const content = fs.readFileSync('server/gamesCatalog.ts', 'utf8');
const jiliGames = JSON.parse(fs.readFileSync('scripts/generated_jili_games.json', 'utf8'));

// Find lines from line 364 (just before "id": "acha_jili_superace") to line 777 (just after bombingfishing)
const lines = content.split('\n');
const startLineIdx = lines.findIndex(l => l.includes('"id": "acha_jili_superace"')) - 1; // points to {
let endLineIdx = lines.findIndex(l => l.includes('"id": "acha_pg_mahjongways"')) - 1; // points to } before mahjongways

console.log('Replacing from line', startLineIdx + 1, 'to line', endLineIdx + 1);

// Format the new 67 JILI games
const formattedJiliGames = jiliGames.map((g, idx) => {
  return JSON.stringify(g, null, 4).split('\n').map(line => '  ' + line).join('\n') + (idx === jiliGames.length - 1 ? ',' : ',');
}).join('\n');

const newContent = [
  ...lines.slice(0, startLineIdx),
  formattedJiliGames,
  ...lines.slice(endLineIdx + 1)
].join('\n');

fs.writeFileSync('server/gamesCatalog.ts', newContent);
console.log('Successfully updated server/gamesCatalog.ts with 67 JILI games!');
