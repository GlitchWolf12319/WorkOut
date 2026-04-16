import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const p2StartIndex = content.indexOf("  {\n    id: 'nippard-pure-bb-p2-updated'");
if (p2StartIndex !== -1) {
    // It's the last element in the array `export const PROGRAMS: Program[] = [`
    // We can slice from p2StartIndex to the end of the array.
    // The file ends with `];` right after the last object.
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex !== -1) {
        content = content.substring(0, p2StartIndex) + content.substring(lastBracketIndex);
        fs.writeFileSync('src/data/programs.ts', content);
        console.log("Removed nippard-pure-bb-p2-updated");
    } else {
        console.log("Couldn't find ];");
    }
} else {
    console.log("Could not find nippard-pure-bb-p2-updated");
}
