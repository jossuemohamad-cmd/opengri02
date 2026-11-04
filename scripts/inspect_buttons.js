const fs = require('fs');

const appJs = fs.readFileSync('public/js/app.js', 'utf8');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Find all button tags and their classes/ids/onclicks
const findButtons = (text, src) => {
  const matches = [...text.matchAll(/<button[^>]*>/gi)];
  return matches.map(m => {
    const raw = m[0];
    const idMatch = raw.match(/id=["']([^"']+)["']/i);
    const classMatch = raw.match(/class=["']([^"']+)["']/i);
    const onclickMatch = raw.match(/onclick=["']([^"']+)["']/i);
    const titleMatch = raw.match(/title=["']([^"']+)["']/i);
    return {
      source: src,
      raw,
      id: idMatch ? idMatch[1] : null,
      class: classMatch ? classMatch[1] : null,
      onclick: onclickMatch ? onclickMatch[1] : null,
      title: titleMatch ? titleMatch[1] : null
    };
  });
};

const appButtons = findButtons(appJs, 'app.js');
const htmlButtons = findButtons(indexHtml, 'index.html');
const allButtons = [...htmlButtons, ...appButtons];

console.log(`Total buttons found: ${allButtons.length}`);
allButtons.forEach(b => {
  console.log(`ID: ${b.id || 'N/A'} | Class: ${b.class || 'N/A'} | OnClick: ${b.onclick || 'N/A'}`);
});

// Check which IDs in app.js have addEventListener
const listenerMatches = [...appJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)\s*\.\s*addEventListener/g)].map(m => m[1]);
console.log('\n--- getElementById event listeners ---');
console.log([...new Set(listenerMatches)]);

// Check for delegated click listeners or document.addEventListener('click')
const clickDelegations = [...appJs.matchAll(/\.addEventListener\(['"]click['"]/g)];
console.log('\nTotal click listeners in app.js:', clickDelegations.length);

