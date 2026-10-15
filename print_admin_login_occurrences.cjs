const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/assets';

const files = [
  'Admin-Jmk8zA-m.js',
  'AdminAcquisition-1mFpY3T7.js',
  'AdminEmails-CNZUMqvN.js',
  'AdminFinance-HJHgsL9E.js',
  'AdminPush-BBSY_KeF.js',
  'AdminStats-DQcPk5YR.js',
  'AdminSubscriptions-5VVHywwm.js'
];

for (const f of files) {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  let pos = 0;
  console.log(`\n=== ${f} ===`);
  while ((pos = code.indexOf('admin-login', pos)) !== -1) {
    console.log(code.substring(Math.max(0, pos - 100), Math.min(code.length, pos + 100)));
    pos += 11;
  }
}
