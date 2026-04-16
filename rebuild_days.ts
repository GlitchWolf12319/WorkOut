import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const p2Index = content.indexOf("id: 'nippard-upper-lower'");
const p2Content = content.substring(p2Index, p2Index + 5000);
const p2Week1Start = p2Content.indexOf('"1": {');
const p2Week2Start = p2Content.indexOf('"2": {');
const p2Week1 = p2Content.substring(p2Week1Start, p2Week2Start);

const p2Matches = p2Week1.match(/"Day [^"]+":/g);
console.log("Upper Lower days:", p2Matches);
