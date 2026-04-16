import fs from 'fs';

let content = fs.readFileSync('src/data/programs.ts', 'utf8');

// For each week 1 to 10
for (let i = 1; i <= 10; i++) {
    const weekRegex = new RegExp(`"${i}": \\{\\s*"days": \\{([\\s\\S]*?)\\s*\\}\\s*\\}`, 'g');
    
    content = content.replace(weekRegex, (match, daysContent) => {
        // Clean up any stray Day 10s or Day 5s from previous attempts
        daysContent = daysContent.replace(/,\s*"Day 10": \[\]/g, '');
        daysContent = daysContent.replace(/"Day 10": \[\],?\s*/g, '');
        daysContent = daysContent.replace(/,\s*"Day 5": \[\]/g, '');
        daysContent = daysContent.replace(/"Day 5": \[\],?\s*/g, '');
        
        const dayPieces = daysContent.split(/\s*,\s*(?="Day \w+": \[)/).map(p => p.trim());
        
        let newDays = [];
        
        const day1 = dayPieces[0];
        const day2 = dayPieces[1];
        const day3 = dayPieces[2];
        const day4 = dayPieces[3]; // The weak point 1
        
        const day7 = dayPieces[4]; // The pull 2
        const day8 = dayPieces[5]; // The push 2
        
        const day9_1 = dayPieces[6]; // Legs 2
        const day9_2 = dayPieces[7]; // Weak Point 2
        
        newDays.push(day1);
        newDays.push(day2);
        newDays.push(day3);
        newDays.push(day4); // It's already "Day 4": ...
        newDays.push(`"Day 5": []`);
        newDays.push(day7.replace(/^"Day 7":/, '"Day 6":'));
        newDays.push(day8.replace(/^"Day 8":/, '"Day 7":'));
        newDays.push(day9_1.replace(/^"Day 9":/, '"Day 8":'));
        newDays.push(day9_2.replace(/^"Day 9":/, '"Day 9":'));
        newDays.push(`"Day 10": []`);
        
        return `"${i}": {\n        "days": {\n          ${newDays.join(',\n          ')}\n        }\n      }`;
    });
}

fs.writeFileSync('src/data/programs.ts', content);
console.log('Done!');
