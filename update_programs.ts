import fs from 'fs';

const content = fs.readFileSync('src/data/programs.ts', 'utf8');

let newContent = content;

// We only want to do this for nippard-pure-bb-ppl, which is the first program.
// The second program starts at id: 'nippard-pure-bb-p2-updated'
const splitIndex = newContent.indexOf("id: 'nippard-pure-bb-p2-updated'");
if (splitIndex === -1) {
  console.error("Could not find second program!");
  process.exit(1);
}

let firstPart = newContent.substring(0, splitIndex);
const secondPart = newContent.substring(splitIndex);

// Replace "Day 9": with "Day 8_TEMP":
firstPart = firstPart.replace(/"Day 9":/g, '"Day 8_TEMP":');
// Replace "Day 8": with "Day 7_TEMP":
firstPart = firstPart.replace(/"Day 8":/g, '"Day 7_TEMP":');
// Replace "Day 7": with "Day 6_TEMP":
firstPart = firstPart.replace(/"Day 7":/g, '"Day 6_TEMP":');
// Replace "Day 5": with "Day 4_TEMP":
firstPart = firstPart.replace(/"Day 5":/g, '"Day 4_TEMP":');
// Replace "Day 5_alt": with "Day 9_TEMP":
firstPart = firstPart.replace(/"Day 5_alt":/g, '"Day 9_TEMP":');

// Now remove _TEMP
firstPart = firstPart.replace(/"Day 8_TEMP":/g, '"Day 8":');
firstPart = firstPart.replace(/"Day 7_TEMP":/g, '"Day 7":');
firstPart = firstPart.replace(/"Day 6_TEMP":/g, '"Day 6":');
firstPart = firstPart.replace(/"Day 4_TEMP":/g, '"Day 4":');
firstPart = firstPart.replace(/"Day 9_TEMP":/g, '"Day 9":');

fs.writeFileSync('src/data/programs.ts', firstPart + secondPart);
console.log('Done');
