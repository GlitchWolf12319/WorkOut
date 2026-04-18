import fs from 'fs';

const fileContent = fs.readFileSync('./src/data/programs.ts', 'utf-8');

function findURL(exerciseName: string) {
  const index = fileContent.indexOf(`"name": "${exerciseName}"`);
  if (index === -1) return "Not found";
  const block = fileContent.substring(index, index + 400);
  const match = block.match(/"videoUrl":\s*"([^"]+)"/);
  return match ? match[1] : "No videoUrl";
}

console.log("DB Calf Jumps:", findURL("DB Calf Jumps"));
console.log("Cross-Body Cable Y-Raise:", findURL("Cross-Body Cable Y-Raise"));
console.log("Cable Paused Shrug-In:", findURL("Cable Paused Shrug-In"));
