import fs from 'fs';

// Let's check all the files mentioned in formal.jiligamesoft.com
const html = await (await fetch('https://formal.jiligamesoft.com/lobby')).text();
console.log('Formal lobby HTML:');
// Find all script tags
const scripts = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
console.log('Scripts in formal lobby:', scripts);

// Let's check _payload.json on formal
try {
  const payloadRes = await fetch('https://formal.jiligamesoft.com/_payload.json?5cd9513f-49db-458f-b219-da96ec39c183');
  console.log('Formal payload status:', payloadRes.status);
  const payload = await payloadRes.json();
  console.log('Formal payload:', JSON.stringify(payload).slice(0, 500));
} catch(e) {
  console.log('No payload on formal:', e.message);
}

// In formal, let's look at the B24ZRiIH.js bundle for routes:
const mainJs = await (await fetch('https://formal.jiligamesoft.com/_nuxt/B24ZRiIH.js')).text();
// Let's find all chunks referenced in mainJs:
const chunks = [...mainJs.matchAll(/"([^"]+\.js)"/g)].map(m => m[1]);
console.log('Formal chunks:', [...new Set(chunks)]);
