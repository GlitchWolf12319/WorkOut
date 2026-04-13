const fs = require('fs');

const text = fs.readFileSync('pdf_text.txt', 'utf8');

// The text has lines for each week.
// I will just write a script to extract the exercises for each week.
// Actually, since the text format is a bit messy, I might need to do it manually or semi-manually.
