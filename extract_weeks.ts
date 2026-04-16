import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const regex = /"weeks": \{\s*"1": \{(.*?)\s*\n    \},/s;
// Let's just match the weeks object completely
const weeksStart = content.indexOf('weeks: {');
const weeksStartAlt = content.indexOf('"weeks": {');
console.log("has weeks:", weeksStart, weeksStartAlt);
