import fs from 'fs';

const FILE = 'src/data/programs.ts';
let content = fs.readFileSync(FILE, 'utf8');

// The file got terribly corrupted somehow from the first regex catch all

// Let's completely restore it
content = content.replace(/"notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook\. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here\.,[\s\S]*?"videoUrl": "https:\/\/www\.youtube\.com\/watch\?v=fjiOCmFljDM"substitutions": \[/g, 
  `"notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",\n              "substitutions": [`
);


content = content.replace(/"notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook\. Perform ONE of the exercises listed under Exercise 2 for the sets and reps provided here\.,[\s\S]*?"videoUrl": "https:\/\/www\.youtube\.com\/watch\?v=fjiOCmFljDM"substitutions": \[/g, 
  `"notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 2 for the sets and reps provided here.",\n              "substitutions": [`
);


content = content.replace(/"notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook\. Perform ONE of the exercises listed under Exercise 3 for the sets and reps provided here\.,[\s\S]*?"videoUrl": "https:\/\/www\.youtube\.com\/watch\?v=fjiOCmFljDM"substitutions": \[/g, 
  `"notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 3 for the sets and reps provided here.",\n              "substitutions": [`
);

fs.writeFileSync(FILE, content);
console.log("Fixed again.");
