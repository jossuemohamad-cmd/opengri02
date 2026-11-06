const fs = require('fs');

const css = fs.readFileSync('public/css/style.css', 'utf8');

// Strip comments
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

// Split by braces
const rules = noComments.split('}');
let malformed = [];

rules.forEach((rule, idx) => {
  const parts = rule.split('{');
  if (parts.length === 2) {
    const selector = parts[0].trim();
    const body = parts[1].trim();

    if (!selector && body) {
      malformed.push(`Empty selector near rule #${idx}: { ${body} }`);
    }

    // Check declarations
    const declarations = body.split(';').map(d => d.trim()).filter(Boolean);
    declarations.forEach(dec => {
      if (!dec.includes(':') && !dec.startsWith('@') && !dec.startsWith('--')) {
        malformed.push(`Malformed declaration in "${selector}": "${dec}"`);
      }
    });
  } else if (parts.length > 2) {
    // Nested e.g. @keyframes or @media
    // acceptable
  }
});

console.log('Malformed declarations count:', malformed.length);
if (malformed.length > 0) {
  console.log('Sample:', malformed.slice(0, 10));
}
