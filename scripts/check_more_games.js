import fs from 'fs';

const txt = fs.readFileSync('temp_demo.js', 'utf8');

// Search for any other occurrences of game_name_en in temp_demo.js
const allEnNames = [...txt.matchAll(/game_name_en:"([^"]+)"/g)].map(m => m[1]);
console.log('Total occurrences of game_name_en in temp_demo.js:', allEnNames.length);

// Search for fishing games like "Mega Fishing", "Bombing Fishing", "Jackpot Fishing", "Dragon Fortune"
const fishTitles = ['Mega Fishing', 'Bombing Fishing', 'Jackpot Fishing', 'Dragon Fortune', 'Happy Fishing', 'All-star Fishing', 'Dinosaur Tycoon'];
for (const t of fishTitles) {
  console.log(`Checking ${t}:`, txt.includes(t));
}

// Search for Crash games: "Go Rush", "Mines", "Tower", "Crash", "Limbo"
const crashTitles = ['Go Rush', 'Mines', 'Tower', 'Limbo', 'Plinko'];
for (const t of crashTitles) {
  console.log(`Checking ${t}:`, txt.includes(t));
}

// Search for Table / Card games: "Teen Patti", "Rummy", "Andar Bahar", "Baccarat", "Blackjack", "Poker King"
const tableTitles = ['Teen Patti', 'Rummy', 'Andar Bahar', 'Baccarat', 'Blackjack', 'Poker King'];
for (const t of tableTitles) {
  console.log(`Checking ${t}:`, txt.includes(t));
}
