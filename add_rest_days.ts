import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
if (splitIndex === -1) {
  console.error("Could not find second program!");
  process.exit(1);
}

let firstPart = content.substring(0, splitIndex);
const secondPart = content.substring(splitIndex);

// Add "Day 5": [] after "Day 4": [...]
// Add "Day 10": [] after "Day 9": [...]
// Since the structure is nested, it's safer to parse or use regex carefully.
// Let's use a replacer function.

firstPart = firstPart.replace(/"Day 4": \[\s*([\s\S]*?)\s*\],/g, (match) => {
  return match + '\n          "Day 5": [],';
});

firstPart = firstPart.replace(/"Day 9": \[\s*([\s\S]*?)\s*\]/g, (match) => {
  return match + ',\n          "Day 10": []';
});

fs.writeFileSync('src/data/programs.ts', firstPart + secondPart);
console.log('Done adding Day 5 and Day 10');
