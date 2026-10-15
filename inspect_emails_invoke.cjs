const fs = require('fs');
const code = fs.readFileSync('assets/AdminEmails-CNZUMqvN.js', 'utf8');
let pos = 0;
while ((pos = code.indexOf('.functions.invoke(', pos)) !== -1) {
  console.log(code.substring(pos, pos + 120));
  pos += 18;
}
