import fs from 'fs';

const updatePrograms = () => {
  let fileContent = fs.readFileSync('./src/data/programs.ts', 'utf-8');

  // Fix Cable Paused Shrug-In
  fileContent = fileContent.replace(
    /"name": "Cable Paused Shrug-In",(\n\s+"target": "Back \(Traps\)",\n\s+"weight": "(?:.*?)",\n\s+"reps": "(?:.*?)",\n\s+"sets": "(?:.*?)",\n\s+"notes": "(?:.*?)",\n\s+)"videoUrl": "https:\/\/www\.youtube\.com\/watch\?v=qsmjaYao9pA"/g,
    `"name": "Cable Paused Shrug-In",$1"videoUrl": "https://www.youtube.com/watch?v=Hy6f1Lz_PiA"`
  );

  // Fix Cross-Body Cable Y-Raise
  fileContent = fileContent.replace(
    /"name": "Cross-Body Cable Y-Raise",(\n\s+"target": "Shoulders \(Side\)",\n\s+"weight": "(?:.*?)",\n\s+"reps": "(?:.*?)",\n\s+"sets": "(?:.*?)",\n\s+"notes": "(?:.*?)",\n\s+)"videoUrl": "https:\/\/www\.youtube\.com\/watch\?v=D-kqUKEQZZ0"/g,
    `"name": "Cross-Body Cable Y-Raise",$1"videoUrl": "https://www.youtube.com/watch?v=64RFJSCJuN8"`
  );

  // Fix DB Calf Jumps
  fileContent = fileContent.replace(
    /"name": "DB Calf Jumps",(\n\s+"target": "Calves",\n\s+"weight": "(?:.*?)",\n\s+"reps": "(?:.*?)",\n\s+"sets": "(?:.*?)",\n\s+"notes": "(?:.*?)",\n\s+)"videoUrl": "https:\/\/www\.youtube\.com\/watch\?v=KDeYqB9GYeg"/g,
    `"name": "DB Calf Jumps",$1"videoUrl": "https://www.youtube.com/watch?v=JkY3nBTbRac"`
  );

  fs.writeFileSync('./src/data/programs.ts', fileContent, 'utf-8');
};

updatePrograms();
console.log('Programs updated!');
