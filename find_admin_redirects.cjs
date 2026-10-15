const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/assets';

for (const f of fs.readdirSync(dir)) {
  if (f.startsWith('Admin') && f.endsWith('.js')) {
    const code = fs.readFileSync(path.join(dir, f), 'utf8');
    const hasAdminLogin = code.includes('admin-login') || code.includes('admin/login');
    const hasSignOut = code.includes('signOut');
    console.log(f, { hasAdminLogin, hasSignOut });
  }
}
