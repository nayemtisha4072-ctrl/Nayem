import fs from 'fs';

const res = await fetch('https://demo.jiligamesoft.com/_nuxt/LSS8Rwz5.js');
const txt = await res.text();
console.log('=== LSS8Rwz5.js content ===');
console.log(txt);
