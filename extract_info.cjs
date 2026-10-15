const fs = require('fs');
const code = fs.readFileSync('C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/bundle.js', 'utf8');

// Find routes
const routes = new Set();
const routeRegex = /path:\s*["']([^"']+)["']/g;
let m;
while ((m = routeRegex.exec(code)) !== null) {
  routes.add(m[1]);
}
console.log('=== ROUTES ===');
console.log(Array.from(routes));

// Find Supabase tables / queries
const tables = new Set();
const tableRegex = /\.from\(\s*["']([^"']+)["']\s*\)/g;
while ((m = tableRegex.exec(code)) !== null) {
  tables.add(m[1]);
}
console.log('=== SUPABASE TABLES ===');
console.log(Array.from(tables));
