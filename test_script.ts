import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-upper-lower'");
let firstPart = content.substring(0, splitIndex);

console.log("Count of Day 5:", (firstPart.match(/"Day 5":/g) || []).length);
console.log("Count of Day 4:", (firstPart.match(/"Day 4":/g) || []).length);
console.log("Count of Day 6:", (firstPart.match(/"Day 6":/g) || []).length);
console.log("Count of Day 7:", (firstPart.match(/"Day 7":/g) || []).length);
console.log("Count of Day 8:", (firstPart.match(/"Day 8":/g) || []).length);
console.log("Count of Day 9:", (firstPart.match(/"Day 9":/g) || []).length);
console.log("Count of Day 5_alt:", (firstPart.match(/"Day 5_alt":/g) || []).length);
