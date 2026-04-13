const fs = require('fs');

let programsTs = fs.readFileSync('src/data/programs.ts', 'utf8');

// 1. Replace dayLabels
programsTs = programsTs.replace(/dayLabels:\s*\{[\s\S]*?\},/, `dayLabels: {
      'Day 1': 'PULL #1 (LAT FOCUSED)',
      'Day 2': 'PUSH #1',
      'Day 3': 'LEGS #1',
      'Day 4': 'REST',
      'Day 5': 'ARMS & WEAK POINTS #1',
      'Day 6': 'REST',
      'Day 7': 'PULL #2 (MID-BACK FOCUSED)',
      'Day 8': 'PUSH #2',
      'Day 9': 'LEGS #2',
      'Day 10': 'REST'
    },`);

// 2. Replace optionalRestDays
programsTs = programsTs.replace(/optionalRestDays:\s*\[.*?\]/, `optionalRestDays: ['Day 4', 'Day 6', 'Day 10']`);

// 3. Replace weakpointAdditions days
programsTs = programsTs.replace(/'Thursday':/g, `'Day 5':`);
programsTs = programsTs.replace(/'Monday':/g, `'Day 1':`);
programsTs = programsTs.replace(/'Tuesday':/g, `'Day 2':`);
programsTs = programsTs.replace(/'Wednesday':/g, `'Day 3':`);
programsTs = programsTs.replace(/'Friday':/g, `'Day 7':`);

// 4. Replace the days in the weeks object
// We need to carefully replace "Monday": [ ... ] with "Day 1": [ Warmup, ... ]
// Let's do this by parsing or by regex. Since it's a large TS file, regex might be tricky but doable if we are careful.
// Actually, it's better to just replace the keys.
programsTs = programsTs.replace(/"Monday": \[/g, `"Day 1": [`);
programsTs = programsTs.replace(/"Tuesday": \[/g, `"Day 2": [`);
programsTs = programsTs.replace(/"Wednesday": \[/g, `"Day 3": [`);
programsTs = programsTs.replace(/"Thursday": \[/g, `"Day 5": [`); // Thursday was Arms & Weak Points
programsTs = programsTs.replace(/"Friday": \[/g, `"Day 7": [`); // Friday was Pull 2
programsTs = programsTs.replace(/"Saturday": \[/g, `"Day 8": [`); // Saturday was Push 2
programsTs = programsTs.replace(/"Sunday": \[/g, `"Day 9": [`); // Sunday was Legs 2
programsTs = programsTs.replace(/"ArmsWeakPoints2": \[/g, `"Day 5_alt": [`); // Just in case, though we mapped Thursday to Day 5

const warmupExercise = `
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },`;

// Insert warmup at the beginning of each day's array
programsTs = programsTs.replace(/"Day 1": \[\s*/g, `"Day 1": [${warmupExercise}\n            `);
programsTs = programsTs.replace(/"Day 2": \[\s*/g, `"Day 2": [${warmupExercise}\n            `);
programsTs = programsTs.replace(/"Day 3": \[\s*/g, `"Day 3": [${warmupExercise}\n            `);
programsTs = programsTs.replace(/"Day 5": \[\s*/g, `"Day 5": [${warmupExercise}\n            `);
programsTs = programsTs.replace(/"Day 7": \[\s*/g, `"Day 7": [${warmupExercise}\n            `);
programsTs = programsTs.replace(/"Day 8": \[\s*/g, `"Day 8": [${warmupExercise}\n            `);
programsTs = programsTs.replace(/"Day 9": \[\s*/g, `"Day 9": [${warmupExercise}\n            `);

fs.writeFileSync('src/data/programs.ts', programsTs);
console.log('Updated programs.ts');
