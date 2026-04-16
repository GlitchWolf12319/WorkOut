import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
let firstPart = content.substring(0, splitIndex);
const secondPart = content.substring(splitIndex);

// We need to rename "Day 5_alt" to "Day 9"
firstPart = firstPart.replace(/"Day 5_alt":/g, '"Day 9":');

// We need to rename "Day 4" to "Day 4_TEMP"
firstPart = firstPart.replace(/"Day 4":/g, '"Day 4_TEMP":');

// We need to rename "Day 5" to "Day 4"
firstPart = firstPart.replace(/"Day 5":/g, '"Day 4":');

// We need to rename "Day 4_TEMP" to "Day 5"
firstPart = firstPart.replace(/"Day 4_TEMP":/g, '"Day 5":');

fs.writeFileSync('src/data/programs.ts', firstPart + secondPart);
console.log('Done');
