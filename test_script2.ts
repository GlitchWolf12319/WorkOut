import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
let firstPart = content.substring(0, splitIndex);

const matches = firstPart.match(/"Day \d+":/g);
if (matches) {
  const counts = {};
  for (const m of matches) {
    counts[m] = (counts[m] || 0) + 1;
  }
  console.log(counts);
}
