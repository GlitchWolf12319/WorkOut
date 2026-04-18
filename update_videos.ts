import fs from 'fs';
import { PROGRAMS } from './src/data/programs';

const updatePrograms = () => {
  let fileContent = fs.readFileSync('./src/data/programs.ts', 'utf-8');

  fileContent = fileContent.replace(
    /"name": "Cable Paused Shrug-In",\n\s+"target": "Back \(Traps\)",\n\s+"weight": "(.*?)",\n\s+"reps": "(.*?)",\n\s+"sets": "(.*?)",\n\s+"notes": "(.*?)",\n\s+"substitutions"/g,
    `"name": "Cable Paused Shrug-In",\n              "target": "Back (Traps)",\n              "weight": "$1",\n              "reps": "$2",\n              "sets": "$3",\n              "notes": "$4",\n              "videoUrl": "https://www.youtube.com/watch?v=qsmjaYao9pA",\n              "substitutions"`
  );

  fileContent = fileContent.replace(
    /"name": "Cross-Body Cable Y-Raise",\n\s+"target": "Shoulders \(Side\)",\n\s+"weight": "(.*?)",\n\s+"reps": "(.*?)",\n\s+"sets": "(.*?)",\n\s+"notes": "(.*?)",\n\s+"substitutions"/g,
    `"name": "Cross-Body Cable Y-Raise",\n              "target": "Shoulders (Side)",\n              "weight": "$1",\n              "reps": "$2",\n              "sets": "$3",\n              "notes": "$4",\n              "videoUrl": "https://www.youtube.com/watch?v=D-kqUKEQZZ0",\n              "substitutions"`
  );

  fileContent = fileContent.replace(
    /"name": "DB Calf Jumps",\n\s+"target": "Calves",\n\s+"weight": "(.*?)",\n\s+"reps": "(.*?)",\n\s+"sets": "(.*?)",\n\s+"notes": "(.*?)",\n\s+"substitutions"/g,
    `"name": "DB Calf Jumps",\n              "target": "Calves",\n              "weight": "$1",\n              "reps": "$2",\n              "sets": "$3",\n              "notes": "$4",\n              "videoUrl": "https://www.youtube.com/watch?v=KDeYqB9GYeg",\n              "substitutions"`
  );

  fs.writeFileSync('./src/data/programs.ts', fileContent, 'utf-8');
};

updatePrograms();
console.log('Programs updated!');
