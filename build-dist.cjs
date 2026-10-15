const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

console.log('Building production bundle for Vercel / distribution...');

// Remove and recreate dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy index.html
console.log('Copying index.html...');
fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(distDir, 'index.html'));

// 2. Copy assets folder (all chunks, styles, scripts)
console.log('Copying assets folder...');
const assetsSrc = path.join(rootDir, 'assets');
const assetsDest = path.join(distDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  copyRecursive(assetsSrc, assetsDest);
}

// 3. Copy public icons & manifests
const staticFiles = [
  'favicon.png',
  'apple-touch-icon.png',
  'manifest.json',
  'monochrome-icon.png',
  'robots.txt'
];

for (const file of staticFiles) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
  }
}

// 4. Copy public folder if exists
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, distDir);
}

console.log('✅ Build completed successfully! Dist is ready.');
