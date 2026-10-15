const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'assets');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

console.log(`Checking ${files.length} js files in assets...`);
for (const f of files) {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  if (code.includes('admin-login') || code.includes('admin/login')) {
    console.log(`\nFound in ${f}:`);
    let matches = [...code.matchAll(/.{0,50}(admin[\-_/]login).{0,50}/g)];
    for (const m of matches) {
      console.log(' -> ', m[0]);
    }
  }
}
