const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/assets';

// 1. Admin-Jmk8zA-m.js
const mainAdmin = path.join(dir, 'Admin-Jmk8zA-m.js');
let code = fs.readFileSync(mainAdmin, 'utf8');

// Replace the entire auth useEffect
code = code.replace(
  /l\.useEffect\(\(\)=>\{\(async\(\)=>\{const\{data:\{session:t\}\}=await b\.auth\.getSession\(\);[\s\S]*?Se\(!0\),Ae\(!1\)\}\)\(\)\},\[C\]\);/,
  'l.useEffect(()=>{Se(!0),Ae(!1)},[C]);'
);

fs.writeFileSync(mainAdmin, code, 'utf8');
console.log('Streamlined Admin-Jmk8zA-m.js');

// 2. AdminEmails-CNZUMqvN.js
const emailsAdmin = path.join(dir, 'AdminEmails-CNZUMqvN.js');
let emailsCode = fs.readFileSync(emailsAdmin, 'utf8');
emailsCode = emailsCode.replace(
  /l\.useEffect\(\(\)=>\{\(async\(\)=>\{const\{data:m\}=await b\.auth\.getSession\(\);[\s\S]*?r\(!1\)\}\)\(\)\},\[a\]\);/,
  'l.useEffect(()=>{r(!1)},[a]);'
);
fs.writeFileSync(emailsAdmin, emailsCode, 'utf8');
console.log('Streamlined AdminEmails-CNZUMqvN.js');

// 3. AdminFinance-HJHgsL9E.js
const finAdmin = path.join(dir, 'AdminFinance-HJHgsL9E.js');
let finCode = fs.readFileSync(finAdmin, 'utf8');
finCode = finCode.replace(
  /a\.useEffect\(\(\)=>\{\(async\(\)=>\{const\{data:s\}=await t\.auth\.getSession\(\);[\s\S]*?n\(!1\)\}\)\(\)\},\[e\]\);/,
  'a.useEffect(()=>{n(!1)},[e]);'
);
fs.writeFileSync(finAdmin, finCode, 'utf8');
console.log('Streamlined AdminFinance-HJHgsL9E.js');

// 4. AdminPush-BBSY_KeF.js
const pushAdmin = path.join(dir, 'AdminPush-BBSY_KeF.js');
let pushCode = fs.readFileSync(pushAdmin, 'utf8');
pushCode = pushCode.replace(
  /e\.useEffect\(\(\)=>\{\(async\(\)=>\{const\{data:n\}=await t\.auth\.getSession\(\);[\s\S]*?l\(!1\)\}\)\(\)\},\[a\]\);/,
  'e.useEffect(()=>{l(!1)},[a]);'
);
fs.writeFileSync(pushAdmin, pushCode, 'utf8');
console.log('Streamlined AdminPush-BBSY_KeF.js');

// 5. AdminStats-DQcPk5YR.js
const statsAdmin = path.join(dir, 'AdminStats-DQcPk5YR.js');
let statsCode = fs.readFileSync(statsAdmin, 'utf8');
statsCode = statsCode.replace(
  /a\.useEffect\(\(\)=>\{\(async\(\)=>\{const\{data:r\}=await t\.auth\.getSession\(\);[\s\S]*?i\(!1\)\}\)\(\)\},\[e\]\);/,
  'a.useEffect(()=>{i(!1)},[e]);'
);
fs.writeFileSync(statsAdmin, statsCode, 'utf8');
console.log('Streamlined AdminStats-DQcPk5YR.js');

// 6. AdminSubscriptions-5VVHywwm.js
const subAdmin = path.join(dir, 'AdminSubscriptions-5VVHywwm.js');
let subCode = fs.readFileSync(subAdmin, 'utf8');
subCode = subCode.replace(
  /a\.useEffect\(\(\)=>\{\(async\(\)=>\{const\{data:i\}=await t\.auth\.getSession\(\);[\s\S]*?l\(!1\)\}\)\(\)\},\[e\]\);/,
  'a.useEffect(()=>{l(!1)},[e]);'
);
fs.writeFileSync(subAdmin, subCode, 'utf8');
console.log('Streamlined AdminSubscriptions-5VVHywwm.js');

console.log('All 6 Admin pages streamlined!');
