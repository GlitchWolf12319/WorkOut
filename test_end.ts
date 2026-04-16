import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');
const p1Index = content.indexOf("id: 'nippard-pure-bb-ppl'");
content = content.substring(p1Index);

const weekRegex = new RegExp(`"1": \\{\\s*"days": \\{([\\s\\S]*?)\\s*\\}\\s*\\}`, 'g');
const match = weekRegex.exec(content);
if (match) {
    const daysContent = match[1];
    const m = daysContent.match(/"Day [^"]+":/g);
    console.log(m);
} else {
    console.log("no match");
}
