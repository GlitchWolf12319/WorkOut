import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const p2Index = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
const firstPart = content.substring(0, p2Index);

const week1Start = firstPart.indexOf('"1": {');
const week2Start = firstPart.indexOf('"2": {');
const week1Content = firstPart.substring(week1Start, week2Start);

const matches = week1Content.match(/"Day [^"]+":/g);
console.log("Days in Week 1:", matches);
