const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, 'assets');
const bundlePath = path.join(__dirname, 'bundle.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const chunks = new Set();
const chunkRegex = /assets\/[A-Za-z0-9_\-]+\.js/g;
let m;
while ((m = chunkRegex.exec(code)) !== null) {
  chunks.add(m[0]);
}

console.log(`Found ${chunks.size} chunks to download...`);

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      return resolve('cached');
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve('downloaded');
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  let count = 0;
  for (const chunk of chunks) {
    const fileName = path.basename(chunk);
    const dest = path.join(assetsDir, fileName);
    const url = `https://fincompass.online/${chunk}`;
    try {
      const res = await downloadFile(url, dest);
      count++;
      console.log(`[${count}/${chunks.size}] ${res}: ${fileName}`);
    } catch (err) {
      console.error(`Failed ${chunk}: ${err.message}`);
    }
  }
  console.log('Done downloading all chunks!');
}

main();
