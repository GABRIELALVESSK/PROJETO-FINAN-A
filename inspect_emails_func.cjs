const fs = require('fs');
const code = fs.readFileSync('assets/AdminEmails-CNZUMqvN.js', 'utf8');
const pos = code.indexOf('admin-emails');
if (pos !== -1) {
  console.log(code.substring(pos - 100, pos + 300));
}
