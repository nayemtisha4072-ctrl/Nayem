import fs from 'fs';

const txt = fs.readFileSync('temp_demo.js', 'utf8');

// Let's find the array Zd or similar variable that contains all games
// In snippet we saw:
// Zd=[{game_id:1,game_code:"2",game_name_cn:"秦皇传说",game_name_en:"Chin Shi Huang",game_cover_image:X+"2.png",game_report_name:"csh"},...

const zdIndex = txt.indexOf('Zd=[');
console.log('Zd=[ index:', zdIndex);

if (zdIndex !== -1) {
  // Find matching bracket
  let openCount = 0;
  let endPos = zdIndex + 3;
  for (let i = zdIndex + 3; i < txt.length; i++) {
    if (txt[i] === '[') openCount++;
    if (txt[i] === ']') {
      openCount--;
      if (openCount === 0) {
        endPos = i;
        break;
      }
    }
  }
  const arrayStr = txt.slice(zdIndex + 3, endPos + 1);
  console.log('Array string length:', arrayStr.length);
  // Evaluate safely by replacing X+ with "https://ik.imagekit.io/pangamesoft/tr:w-240,q-70,f-webp,cm-extract/jili/game/"
  const evalStr = 'const X = "https://ik.imagekit.io/pangamesoft/tr:w-480,q-80,f-webp,cm-extract/jili/game/"; return ' + arrayStr;
  const games = new Function(evalStr)();
  console.log('Total JILI games extracted:', games.length);
  console.log('First 5 games:', games.slice(0, 5));
  console.log('Last 5 games:', games.slice(-5));
  fs.writeFileSync('scripts/jili_games_extracted.json', JSON.stringify(games, null, 2));
  console.log('Saved to scripts/jili_games_extracted.json');
} else {
  console.log('Zd=[ not found, searching other patterns');
  const match = txt.match(/([a-zA-Z0-9_$]+)=\[\{game_id:1,/);
  if (match) {
    console.log('Found var:', match[1]);
  }
}
