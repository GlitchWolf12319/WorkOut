import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const weekRegex = new RegExp(`"1": \\{\\s*"days": \\{([\\s\\S]*?)\\s*\\}\\s*\\}`, 'g');
const match = weekRegex.exec(content);
let daysContent = match[1];

// Remove the Day 10 empty arrays completely for now to simplify
daysContent = daysContent.replace(/,\s*"Day 10": \[\]/g, '');
daysContent = daysContent.replace(/"Day 10": \[\],?\s*/g, '');

const dayPieces = daysContent.split(/\s*,\s*(?="Day \w+": \[)/);

console.log("Pieces count:", dayPieces.length);
dayPieces.forEach(p => {
    console.log("---");
    console.log(p.substring(0, 30));
    console.log(p.substring(p.length - 20));
});
