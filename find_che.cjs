const fs = require('fs');
const code = fs.readFileSync('assets/index-DBgGkI22.js', 'utf8');

const pos = code.indexOf('cHe=');
console.log('cHe definition:');
console.log(code.substring(Math.max(0, pos - 50), Math.min(code.length, pos + 400)));
