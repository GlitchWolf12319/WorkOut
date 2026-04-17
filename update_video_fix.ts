import fs from 'fs';

const FILE = 'src/data/programs.ts';
let content = fs.readFileSync(FILE, 'utf8');

// I will just add the videoURL to Cuffed Behind-The-Back Lateral Raise specifically
const regex = /("name": "Cuffed Behind-The-Back Lateral Raise",[\s\S]*?"notes": "[^"]+")/g;

let count = 0;
const updated = content.replace(regex, (match, p1) => {
    count++;
    return `${p1},\n              "videoUrl": "https://www.youtube.com/watch?v=fjiOCmFljDM"`;
});

fs.writeFileSync(FILE, updated);
console.log(`Updated ${count} occurrences with specific video URL.`);
