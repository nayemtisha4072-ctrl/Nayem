import fs from 'fs';

const txt = fs.readFileSync('temp_demo.js', 'utf8');

// Find all game objects in txt
// Pattern: {game_id:...,game_code:"...",game_name_cn:"...",game_name_en:"...",game_cover_image:...}
const gameRegex = /\{game_id:(\d+),game_code:"([^"]+)",game_name_cn:"([^"]+)",game_name_en:"([^"]+)",game_cover_image:([^,]+),game_report_name:"([^"]+)"\}/g;

let match;
const demoGames = [];
while ((match = gameRegex.exec(txt)) !== null) {
  demoGames.push({
    game_id: parseInt(match[1]),
    game_code: match[2],
    game_name_cn: match[3],
    game_name_en: match[4],
    game_cover_image_expr: match[5],
    game_report_name: match[6]
  });
}

console.log('Extracted demo games count with regex 1:', demoGames.length);

// What about category or other fields?
// Let's inspect where X is defined (game_cover_image: X + "49.png")
const xIndex = txt.indexOf('game_cover_image:');
if (xIndex !== -1) {
  console.log('Context around game_cover_image:');
  console.log(txt.slice(Math.max(0, xIndex - 500), Math.min(txt.length, xIndex + 100)));
}
