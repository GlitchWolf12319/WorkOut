import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

const splitIndex = content.indexOf("id: 'nippard-pure-bb-p2-updated'");
let firstPart = content.substring(0, splitIndex);
const secondPart = content.substring(splitIndex);

// Let's reset firstPart to what it was before our last script
// Actually, let's just do it manually.
// Day 1: Pull #1 
// Day 2: Push #1 
// Day 3: Legs #1 
// Day 4: Weak Point Day #1 
// Day 5: REST
// Day 6: Pull #2 
// Day 7: Push #2 
// Day 8: Legs #2
// Day 9: Weak Point Day #2 
// Day 10: REST

// In the current file:
// "Day 4" is the old "Day 5" (Weak Point Day #1)
// "Day 5" is the old "Day 4" (REST)
// "Day 6" is missing? Let's check test_script3 output:
// "Day 1", "Day 2", "Day 3", "Day 4", "Day 7", "Day 8", "Day 9", "Day 10", "Day 9"
// Wait, Day 6 is missing!
