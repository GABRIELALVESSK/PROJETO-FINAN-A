const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'assets');

const files = [
  'AdminStats-DQcPk5YR.js',
  'AdminSubscriptions-5VVHywwm.js',
  'AdminFinance-HJHgsL9E.js',
  'AdminAcquisition-1mFpY3T7.js',
  'AdminEmails-CNZUMqvN.js',
  'AdminPush-BBSY_KeF.js'
];

for (const f of files) {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log(`\n=================== ${f} (${code.length} bytes) ===================`);
  
  // Find useEffect hooks or check functions
  let matches = [...code.matchAll(/.{0,100}(\/admin[\-_/a-z]*).{0,100}/g)];
  for (const m of matches) {
    console.log('Context:', m[0]);
  }
}
