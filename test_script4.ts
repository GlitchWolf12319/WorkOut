import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
let firstPart = content.substring(0, splitIndex);

const week1Start = firstPart.indexOf('"1": {');
const week2Start = firstPart.indexOf('"2": {');

const week1Content = firstPart.substring(week1Start, week2Start);
console.log(week1Content.substring(0, 1000));
