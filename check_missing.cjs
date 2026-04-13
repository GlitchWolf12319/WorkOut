const fs = require('fs');
const programsTs = fs.readFileSync('src/data/programs.ts', 'utf8');

// Find all exercises in the file
const exerciseRegex = /\{\s*"name":\s*"([^"]+)",\s*"target":\s*"[^"]+",\s*"weight":\s*"[^"]+",\s*"reps":\s*"[^"]+",\s*"sets":\s*"[^"]+",\s*"notes":\s*"[^"]+",\s*(?:"videoUrl":\s*"([^"]+)",\s*)?"substitutions":\s*\[[^\]]*\]\s*\}/g;

let match;
let missing = 0;
let total = 0;
const uniqueMissing = new Set();
while ((match = exerciseRegex.exec(programsTs)) !== null) {
  total++;
  if (!match[2]) {
    missing++;
    uniqueMissing.add(match[1]);
  }
}

console.log(`Total exercises: ${total}`);
console.log(`Missing videoUrl: ${missing}`);
console.log(`Unique missing exercises:`);
for (const name of uniqueMissing) {
  console.log(`- ${name}`);
}
