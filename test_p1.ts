import fs from 'fs';
let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const p1Index = content.indexOf("id: 'nippard-pure-bb-ppl'");
const weeksIndex = content.indexOf('weeks: {', p1Index);
const p1Content = content.substring(p1Index, weeksIndex);

console.log(p1Content);
