import fs from 'fs';

const FILE = 'src/data/programs.ts';
let content = fs.readFileSync(FILE, 'utf8');

const regex = /("name": "Cuffed Behind-The-Back Lateral Raise",[\s\S]*?"notes": "[^"]+")(\s*,\s*"substitutions")/g;

let count = 0;
const updated = content.replace(regex, (match, p1, p2) => {
    count++;
    return `${p1},\n              "videoUrl": "https://www.youtube.com/watch?v=kR2C-M3Yg-k"${p2}`;
});

fs.writeFileSync(FILE, updated);
console.log(`Replaced ${count} occurrences.`);
