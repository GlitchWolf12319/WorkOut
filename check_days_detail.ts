import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const p2Index = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
const firstPart = content.substring(0, p2Index);

const week1Start = firstPart.indexOf('"1": {');
const week2Start = firstPart.indexOf('"2": {');
const week1Content = firstPart.substring(week1Start, week2Start);

const regex = /("Day [^"]+":) \[\s*\{\s*"name": "([^"]+)"/g;
let match;
while ((match = regex.exec(week1Content)) !== null) {
  console.log(`${match[1]} - ${match[2]}`);
}

// Since Day 10 might be an empty array, it won't match. Let's find empty arrays too.
const regexEmpty = /("Day [^"]+":) \[\]/g;
while ((match = regexEmpty.exec(week1Content)) !== null) {
  console.log(`${match[1]} - []`);
}
