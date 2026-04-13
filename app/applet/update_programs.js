const fs = require('fs');

const programsFile = 'src/data/programs.ts';
let programsContent = fs.readFileSync(programsFile, 'utf8');

const outputJson = fs.readFileSync('output.json', 'utf8');

// Find the start of the weeks object for nippard-pure-bb-ppl
const startMarker = "    weeks: {";
const startIndex = programsContent.indexOf(startMarker);

// Find the end of the weeks object. It ends before the next program or the end of the array.
// The next program starts with "  },"
const endMarker = "  },\n  {\n    id: 'nippard-pure-bb-p2-updated',";
const endIndex = programsContent.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  // We need to replace the weeks object AND the dayLabels object.
  // Let's just replace the whole program object.
  // Actually, replacing just the weeks object is easier.
  const newWeeks = "    weeks: " + outputJson.replace(/\n/g, '\n    ') + "\n";
  
  programsContent = programsContent.substring(0, startIndex) + newWeeks + programsContent.substring(endIndex);
  
  // Now replace dayLabels
  const dayLabelsStart = programsContent.indexOf("    dayLabels: {");
  const dayLabelsEnd = programsContent.indexOf("    },", dayLabelsStart) + 6;
  
  const newDayLabels = `    dayLabels: {
      'Monday': 'PULL #1 (LAT FOCUSED)',
      'Tuesday': 'PUSH #1',
      'Wednesday': 'LEGS #1',
      'Thursday': 'ARMS & WEAK POINTS #1',
      'Friday': 'PULL #2 (MID-BACK FOCUSED)',
      'Saturday': 'PUSH #2',
      'Sunday': 'LEGS #2',
      'ArmsWeakPoints2': 'ARMS & WEAK POINTS #2',
      'Rest': 'REST'
    },`;
    
  programsContent = programsContent.substring(0, dayLabelsStart) + newDayLabels + programsContent.substring(dayLabelsEnd);
  
  fs.writeFileSync(programsFile, programsContent);
  console.log("Successfully updated programs.ts");
} else {
  console.log("Could not find markers", startIndex, endIndex);
}
