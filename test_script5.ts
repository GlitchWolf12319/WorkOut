import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
let firstPart = content.substring(0, splitIndex);

const week1Start = firstPart.indexOf('"1": {');
const week2Start = firstPart.indexOf('"2": {');

const week1Content = firstPart.substring(week1Start, week2Start);
const day3Index = week1Content.indexOf('"Day 3":');
const day5Index = week1Content.indexOf('"Day 5":');

console.log(week1Content.substring(day3Index, day5Index + 100));
