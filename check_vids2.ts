import fs from 'fs';

let fileContent = fs.readFileSync('./src/data/programs.ts', 'utf-8');
const index = fileContent.indexOf('"name": "DB Calf Jumps"');
console.log(fileContent.substring(index, index + 400));

const index2 = fileContent.indexOf('"name": "Cross-Body Cable Y-Raise"');
console.log(fileContent.substring(index2, index2 + 400));

const index3 = fileContent.indexOf('"name": "Cable Paused Shrug-In"');
console.log(fileContent.substring(index3, index3 + 400));
