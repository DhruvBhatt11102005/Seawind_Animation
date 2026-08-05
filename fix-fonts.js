const fs = require('fs');
const path = require('path');

const root = 'd:/Dhruv/p3';
const dirs = ['services', 'portfolio', 'blog'];

// All top-level pages too
const topPages = [
  'about.html','blog.html','careers.html','contact.html',
  'services.html','portfolio.html','technologies.html',
  'payment.html','privacy-policy.html','terms-of-service.html'
];

const PRECONNECT = '  <link rel="preconnect" href="https://api.fontshare.com" />';

function fixFile(filePath, prefix) {
  let c = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add fontshare preconnect
  if (!c.includes('api.fontshare.com')) {
    c = c.replace(
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' + PRECONNECT
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('FIXED:', filePath.replace(root + '/', ''));
  }
}

// Fix subdirectory pages
dirs.forEach(d => {
  const dirPath = path.join(root, d);
  if (!fs.existsSync(dirPath)) return;
  fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.html'))
    .forEach(f => fixFile(path.join(dirPath, f), '../'));
});

// Fix top-level pages
topPages.forEach(f => {
  const fp = path.join(root, f);
  if (fs.existsSync(fp)) fixFile(fp, '');
});

console.log('Done.');
