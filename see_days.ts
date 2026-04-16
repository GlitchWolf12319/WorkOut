import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const m = content.match(/"Day [^"]+":/g);
console.log(m.slice(0, 20));
