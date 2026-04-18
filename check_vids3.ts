import fs from 'fs';

let fileContent = fs.readFileSync('./src/data/programs.ts', 'utf-8');

const index3 = fileContent.indexOf('"name": "Cable Paused Shrug-In"');
console.log(fileContent.substring(index3, index3 + 600));

const index2 = fileContent.indexOf('"name": "Cross-Body Cable Y-Raise"');
console.log(fileContent.substring(index2, index2 + 600));

const index1 = fileContent.indexOf('"name": "DB Calf Jumps"');
console.log(fileContent.substring(index1, index1 + 600));
