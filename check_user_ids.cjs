const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/assets';
const adminFiles = [
  'Admin-Jmk8zA-m.js',
  'AdminEmails-CNZUMqvN.js',
  'AdminFinance-HJHgsL9E.js',
  'AdminPush-BBSY_KeF.js',
  'AdminStats-DQcPk5YR.js',
  'AdminSubscriptions-5VVHywwm.js'
];

for (const file of adminFiles) {
  const code = fs.readFileSync(path.join(dir, file), 'utf8');
  const match = code.match(/user_roles[\s\S]{0,100}\.eq\("user_id",([a-zA-Z0-9_\$\.]+)\)/);
  if (match) {
    console.log(file, 'matches:', match[0]);
  }
}
