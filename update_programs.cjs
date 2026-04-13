const fs = require('fs');

const videos = JSON.parse(fs.readFileSync('video_titles.json', 'utf8'));
let programsTs = fs.readFileSync('src/data/programs.ts', 'utf8');

// We want to add videoUrl: "https://www.youtube.com/watch?v=ID" to the exercises in Program 1.
// Program 1 is the first one in the array.
// Let's find all exercises in the file and if their name matches a video title, we add the videoUrl.
// Actually, the video titles might be slightly different from the exercise names.
// Let's create a map of normalized titles to video IDs.
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const videoMap = {};
for (const v of videos) {
  if (v.title && v.title !== 'Unknown' && v.title !== 'Error') {
    videoMap[normalize(v.title)] = v.id;
  }
}

// Some manual mappings if they don't match exactly
const manualMap = {
  "lowinclinedumbbellflye": "gfIx0U5bTMA", // LOW INCLINE DB FLYE
  "sloweccentricbayesiancurl": "eJF2gdt9PcE", // SLOW-ECCENTRIC BAYESIAN CABLE CURL
};

let matchCount = 0;

// We can use a regex to find all exercise objects.
// They look like:
// {
//   "name": "Cross-Body Lat Pull-Around",
//   "target": "Back (Lats)",
//   ...
//   "substitutions": [ ... ]
// }
// We can replace them.

const exerciseRegex = /\{\s*"name":\s*"([^"]+)",\s*"target":\s*"[^"]+",\s*"weight":\s*"[^"]+",\s*"reps":\s*"[^"]+",\s*"sets":\s*"[^"]+",\s*"notes":\s*"[^"]+",\s*"substitutions":\s*\[[^\]]*\]\s*\}/g;

programsTs = programsTs.replace(exerciseRegex, (match, name) => {
  const normName = normalize(name);
  let id = videoMap[normName] || manualMap[normName];
  
  // Try partial match if not found
  if (!id) {
    for (const v of videos) {
      if (v.title && v.title !== 'Unknown' && v.title !== 'Error') {
        const normTitle = normalize(v.title);
        if (normTitle.includes(normName) || normName.includes(normTitle)) {
          id = v.id;
          break;
        }
      }
    }
  }

  if (id) {
    matchCount++;
    // Insert videoUrl before substitutions
    return match.replace(/"substitutions":/, `"videoUrl": "https://www.youtube.com/watch?v=${id}",\n              "substitutions":`);
  }
  return match;
});

console.log(`Matched ${matchCount} exercises`);
fs.writeFileSync('src/data/programs.ts', programsTs);
