import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');
const p1Index = content.indexOf("id: 'nippard-pure-bb-ppl'");
content = content.substring(p1Index);

const weekRegex = new RegExp(`"1": \\{\\s*"days": \\{([\\s\\S]*?)\\s*\\}\\s*\\}`, 'g');
const match = weekRegex.exec(content);
if (match) {
    const daysContent = match[1];
    const pieces = daysContent.split(/"Day \w+": \[\s*/);
    
    // Day 1
    console.log("DAY 1 (Pull #1):");
    const day1Match = pieces[1].match(/\{\s*"name":\s*"([^"]+)"/g);
    console.log(day1Match ? day1Match.slice(1, 3).map(m => m.split('"')[3]) : []);
    
    // Day 6
    console.log("\nDAY 6 (Pull #2):");
    const day6Match = pieces[6].match(/\{\s*"name":\s*"([^"]+)"/g);
    console.log(day6Match ? day6Match.slice(1, 3).map(m => m.split('"')[3]) : []);
}
