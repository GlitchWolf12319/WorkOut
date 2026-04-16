import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

// There's only one program now.
// For weeks 1 to 10:
let newContent = content;

for (let week = 1; week <= 10; week++) {
  const rs = `"${week}": \\{\\s*"days": \\{([\\s\\S]*?)\\n\\s*\\}`;
  const r = new RegExp(rs);
  
  const m = r.exec(newContent);
  if (m) {
    const daysContent = m[1];
    
    // We expect the blocks to be in this order in the raw string:
    // Day 1
    // Day 2
    // Day 3
    // Day 4 (originally Day 5)
    // Day 7 (originally Day 7/Pull 2 but I didn't rename it)
    // Day 8 (originally Day 8/Push 2)
    // Day 9 (first one, originally Day 9/Legs 2)
    // Day 10 (empty)
    // Day 9 (second one, originally Day 5_alt)
    
    // Let's grab all "Day ...": [  ... ] using a regex
    const dayRegex = /"Day \w+": \[\s*[\s\S]*?(?=\n\s*"Day \w+": \[|\n\s*"Day 10": \[\]|\s*$)/g;
    const blocks = [];
    let match;
    let tempContent = daysContent;
    
    // Day 10 might just be "Day 10": []
    const dayBlocks = tempContent.match(/"Day [^"]+": \[\s*[\s\S]*?(?=\n\s*"Day [^"]+": \b|\n\s*"Day [^"]+": \[\]|$)/g);
    
    // Wait, let's just do a simpler split
    const parts = daysContent.split(/\n\s*"Day [^"]+":/);
    // parts[0] might be empty or whitespace
    // Let's just find the indices of "Day "
  }
}

// Alternatively, since we just have a sequence of replacements we did:
// We replaced "Day 5_alt" -> "Day 9"
// We replaced "Day 4" -> "Day 4_TEMP"
// We replaced "Day 5" -> "Day 4"
// We replaced "Day 4_TEMP" -> "Day 5"

// So currently the string has the old Day 7, Day 8, Day 9.
// We just need to change the string sequentially without overlapping.
// We want:
// Day 7 -> Day 6
// Day 8 -> Day 7
// The FIRST Day 9 -> Day 8
// The SECOND Day 9 -> Day 9
// Wait, we need to distinguish the first Day 9 and the second Day 9.
// Well, we can replace all "Day 9" with "Day 8", then replace "Day 5_alt" with "Day 9"... wait, "Day 5_alt" is gone, it's ALREADY replaced with "Day 9".
