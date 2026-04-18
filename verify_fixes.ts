import fs from 'fs';

let fileContent = fs.readFileSync('./src/data/programs.ts', 'utf-8');

function showMatch(name: string) {
    const idx = fileContent.indexOf(`"name": "${name}"`);
    console.log(fileContent.substring(idx, idx + 450));
}

showMatch("Cable Paused Shrug-In");
showMatch("Cross-Body Cable Y-Raise");
showMatch("DB Calf Jumps");
