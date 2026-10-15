const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'assets');

const files = fs.readdirSync(dir).filter(f => f.startsWith('Admin') && f.endsWith('.js'));

for (const f of files) {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log(`\n=================== ${f} ===================`);
  
  // Search for navigation calls or redirects
  const regex = /["'](\/(admin[a-z\-_/]*|auth[a-z\-_/]*|login))["']/g;
  let match;
  const paths = new Set();
  while ((match = regex.exec(code)) !== null) {
    paths.add(match[1]);
  }
  console.log('Referenced admin/auth paths:', Array.from(paths));
  
  // Search for getSession or user_roles checks
  const hasAuth = code.includes('getSession') || code.includes('user_roles');
  console.log('Has auth/role check:', hasAuth);
}
