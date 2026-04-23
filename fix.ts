import fs from 'fs';

const FILE = './src/App.tsx';
let content = fs.readFileSync(FILE, 'utf-8');

// I will do direct edits instead of regex.
