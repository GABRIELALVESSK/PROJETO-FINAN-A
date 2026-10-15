const fs = require('fs');
const code = fs.readFileSync('C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/bundle.js', 'utf8');

const assetMatches = code.match(/["']\/assets\/[^"']+["']/g) || [];
const imageMatches = code.match(/["'][^"']+\.(?:png|jpg|jpeg|svg|webp|ico)["']/g) || [];

console.log('Unique /assets/ paths:', Array.from(new Set(assetMatches)));
console.log('Unique images:', Array.from(new Set(imageMatches)).filter(x => !x.includes('w3.org') && !x.includes('http')).slice(0, 40));
