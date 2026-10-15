const fs = require('fs');
const code = fs.readFileSync('assets/index-DBgGkI22.js', 'utf8');
let pos = 0;
while ((pos = code.indexOf('/admin', pos)) !== -1) {
  console.log('---');
  console.log(code.substring(Math.max(0, pos - 100), Math.min(code.length, pos + 150)));
  pos += 6;
}
