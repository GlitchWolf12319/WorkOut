import { WorkoutItem } from '../types';

export interface ProgramExercise extends Omit<WorkoutItem, 'id' | 'completed' | 'reps'> {
  reps: number | string;
  substitutions?: string[];
  videoUrl?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  author: string;
  totalWeeks: number;
  weeks: {
    [weekRange: string]: { // e.g., "1-4", "5-8", "9-10"
      days: {
        [day: string]: ProgramExercise[];
      };
    };
  };
  dayLabels?: {
    [day: string]: string; // e.g., "Monday": "PULL (LAT FOCUSED)"
  };
  optionalRestDays?: string[];
  weakpointOptions?: string[];
  weakpointAdditions?: {
    [weakpoint: string]: {
      [day: string]: ProgramExercise[];
    };
  };
}

export const PROGRAMS: Program[] = [
  {
    id: 'nippard-pure-bb-ppl',
    name: 'Pure Bodybuilding PPL',
    author: 'Jeff Nippard',
    description: 'A 10-day Push/Pull/Legs split designed for maximum hypertrophy. (10 Weeks)',
    totalWeeks: 10,
    dayLabels: {
      'Day 1': 'Pull #1',
      'Day 2': 'Push #1',
      'Day 3': 'Legs #1',
      'Day 4': 'Weak Point Day #1',
      'Day 5': 'REST',
      'Day 6': 'Pull #2',
      'Day 7': 'Push #2',
      'Day 8': 'Legs #2',
      'Day 9': 'Weak Point Day #2',
      'Day 10': 'REST'
    },
    optionalRestDays: ['Day 5', 'Day 10'],
    weakpointOptions: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
    weakpointAdditions: {
      'Chest': {
        'Day 4': [
          { name: 'Pec Deck Fly', target: 'Chest', weight: 'RPE 9', reps: '12-15', sets: '2', notes: 'Focus on the stretch and squeeze.' }
        ]
      },
      'Back': {
        'Day 1': [
          { name: 'Lat Pulldown', target: 'Back', weight: 'RPE 9', reps: '10-12', sets: '2', notes: 'Pull with elbows.' }
        ]
      },
      'Shoulders': {
        'Day 2': [
          { name: 'Dumbbell Lateral Raise', target: 'Shoulders', weight: 'RPE 9', reps: '15-20', sets: '2', notes: 'High volume.' }
        ]
      },
      'Arms': {
        'Day 3': [
          { name: 'Incline DB Curl', target: 'Biceps', weight: 'RPE 9', reps: '10-12', sets: '2', notes: 'Deep stretch.' },
          { name: 'Overhead Extension', target: 'Triceps', weight: 'RPE 9', reps: '12-15', sets: '2', notes: 'Full extension.' }
        ]
      },
      'Legs': {
        'Day 6': [
          { name: 'Leg Extension', target: 'Quads', weight: 'RPE 9', reps: '15-20', sets: '2', notes: 'Burnout.' }
        ]
      }
    },
    weeks: {
      "1": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cross-Body Lat Pull-Around",
              "target": "Back (Lats)",
              "weight": "RPE 9-10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=8W67lZ5mwTU",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Neutral-Grip Pullup"
              ]
            },
            {
              "name": "Snatch-Grip RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 6-7",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=CenC1xVpMvI",
              "substitutions": [
                "DB RDL",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Straight-Bar Lat Prayer",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward to get a big stretch on the lats at the top of the ROM and then stand upright as you squeeze your lats at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=YrcnBlH8XDA",
              "substitutions": [
                "Machine Lat Pullover",
                "DB Lat Pullover"
              ]
            },
            {
              "name": "Hammer Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These will target the brachialis and forearms hard. Squeeze the dumbbell hard in the middle of the handle and curl about 3/4 of the way up (i.e. stay in the bottom 3/4 of the curl).",
              "videoUrl": "https://www.youtube.com/watch?v=dEdnC3ca-Yg",
              "substitutions": [
                "Fat-Grip Preacher Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Lying Paused Rope Face Pull",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard!",
              "videoUrl": "https://www.youtube.com/watch?v=jTmI3Q1iQUk",
              "substitutions": [
                "Rope Face Pull",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up and out in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline Smith Machine Press",
              "target": "Chest",
              "weight": "RPE 9-10",
              "reps": "8-10",
              "sets": "4",
              "notes": "Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=2ITgeRy2z2s",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline DB Press"
              ]
            },
            {
              "name": "Pec Deck (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Set up the pec deck to allow for maximum stretch. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=NPa8YvUg4CM",
              "substitutions": [
                "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8",
              "sets": "3",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week at the set rep target. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Hack Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=TWUnnDK8rck",
              "substitutions": [
                "Machine Squat",
                "Front Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "Leg Press Calf Press",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=S6DTPNZ_-F4",
              "substitutions": [
                "Donkey Calf Raise",
                "Seated Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Bayesian Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm. Take the weaker arm to an RPE of 9-10. Then match the reps with the other arm (stop once you've matched the reps, even if the RPE is lower). If you don't have a size imbalance, do these both arms at the same time.",
              "videoUrl": "https://www.youtube.com/watch?v=CWH5J_7kzjM",
              "substitutions": [
                "DB Incline Curl",
                "DB Scott Curl"
              ]
            },
            {
              "name": "Seated DB French Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10",
              "sets": "3",
              "notes": "Place both palms under the head of a dumbbell and perform overhead extensions. Feel a deep stretch on your triceps at the bottom. Avoid pausing at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=5KX0EjOTMaI",
              "substitutions": [
                "EZ-bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bottom-2/3 Constant Tension Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Stay in the bottom 2/3 of the curl. Don't squeeze all the way up to the top. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=vHBedP8oeCA",
              "substitutions": [
                "Bottom-2/3 EZ-Bar Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "Bench Dip",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Super-ROM Overhand Cable Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set up a wide grip pulldown bar on a seated cable row. Using a double overhand grip, perform rows while leaning forward on the negative and then extend your torso to be upright as you finish the row.",
              "videoUrl": "https://www.youtube.com/watch?v=a7AH8W7dQIw",
              "substitutions": [
                "Overhand Machine Row",
                "Arm-Out Single-Arm DB Row"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Lean-Back Lat Pulldown",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Initiate the pulldown with a straight up posture. As you pull the bar down, lean back by about 15-30° to get the mid-back more involved. Softly touch the bar to your chest on every rep and, even though you're leaning back, still control the weight!",
              "videoUrl": "https://www.youtube.com/watch?v=Zjzt4MRbAlc",
              "substitutions": [
                "Lean-Back Machine Pulldown",
                "Medium-Grip Pull Up"
              ]
            },
            {
              "name": "Inverse DB Zottman Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Do a hammer curl on the positive, then turn your palms facing up at the top and use a palms-up grip on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=jBIvbpyb99M",
              "substitutions": [
                "Slow-Eccentric DB Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Reverse Flye (Mechanical Dropset)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "5,4,3+",
              "sets": "3",
              "notes": "You'll probably want to watch the video for this one. Take ~3 big steps back from the cable machine and do your first 5 reps. After those first 5 reps, immediately (without resting) take 1 step forward and do another 4 reps. Then (without resting) take another step forward and do at least another 3 reps (or until you hit RPE 9-10).",
              "videoUrl": "https://www.youtube.com/watch?v=nN5RV1arpfM",
              "substitutions": [
                "Reverse Pec Deck",
                "Bent-Over Reverse DB Flye"
              ]
            },
            {
              "name": "Cable Paused Shrug-In",
              "target": "Back (Traps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Shrug up and in. Think about shrugging \"up to your ears\". 1-2 second pause in the squeeze (at the top) of each rep, then another 1-2 second pause in the stretch (at the bottom) of each rep.",
              "substitutions": [
                "Machine Shrug",
                "DB Shrug"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Machine Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps.",
              "videoUrl": "https://www.youtube.com/watch?v=SCQVmN1gYsk",
              "substitutions": [
                "Cable Shoulder Press",
                "Seated DB Shoulder Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Paused Assisted Dip",
              "target": "Chest/Triceps",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Slow 2-3 second negative. 1-2 second pause at the bottom. Explode with control on the way up. Go as deep as your shoulders comfortably allow, trying to at least break a 90° elbow angle.",
              "videoUrl": "https://www.youtube.com/watch?v=RyGOGviYWts",
              "substitutions": [
                "Decline Machine Chest Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Low-Incline Dumbbell Flye",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "2",
              "notes": "Focus on feeling a deep stretch in your pecs at the bottom of each rep. Keep the dumbbells in the bottom ~3/4 of the range of motion as there will be no tension on the pecs at the top. We are including these because the dumbbells' resistance profile really accentuates the stretch.",
              "videoUrl": "https://www.youtube.com/watch?v=gfIx0U5bTMA",
              "substitutions": [
                "Low-To-High Cable Crossover",
                "Pec Deck"
              ]
            },
            {
              "name": "Katana Triceps Extension",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions.",
              "videoUrl": "https://www.youtube.com/watch?v=R7f45Mv7yyg",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB French Press"
              ]
            },
            {
              "name": "Ab Wheel Rollout",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Don't just bend at your hips, use your abs to lower yourself down under control and pull yourself back up. If you don't have the core strength to get all the way extended at the bottom, try to progressively increase the ROM week to week.",
              "videoUrl": "https://www.youtube.com/watch?v=gGTgyCU9gcg",
              "substitutions": [
                "Swiss Ball Rollout",
                "LLPT Plank"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Leg Press",
              "target": "Legs (Quads)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep. Try to add a little weight each week at the same rep count.",
              "videoUrl": "https://www.youtube.com/watch?v=1yKAQLVV_XI",
              "substitutions": [
                "Belt Squat",
                "High-Bar Back Squat"
              ]
            },
            {
              "name": "Smith Machine Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 9-10",
              "reps": "8",
              "sets": "2",
              "notes": "2 sets each leg. Minimize contribution from the back leg. Mind-muscle connection with your glutes here!",
              "videoUrl": "https://www.youtube.com/watch?v=SEjKxJGg_C8",
              "substitutions": [
                "Barbell Lunge",
                "DB Step Up"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Sissy Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow yourself to come up onto your toes and push your knees forward past your toes. This is safe for the knees. If you feel knee pain doing them, though, feel free to go with a substitution. They may feel awkward at first, but they're really underrated for the quads! Don't give up on them too quickly.",
              "videoUrl": "https://www.youtube.com/watch?v=eWAjlO4FWPQ",
              "substitutions": [
                "Leg Extension",
                "Goblet Squat"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Leg Press Calf Press",
                "Donkey Calf Raise"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Cable Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow the cable to move back behind your head for maximum stretch on the triceps. Reach full extension with your elbows still around eye level at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=L3lMBRwsFlw",
              "substitutions": [
                "EZ-Bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Kneeling Overhead Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Kneel down, stick your arm straight out to the side and do cable curls. You should feel a tight squeeze at the top of each rep on these.",
              "videoUrl": "https://www.youtube.com/watch?v=KokUK4RgsHc",
              "substitutions": [
                "Overhead Cable Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Incline DB Stretch-Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Keep your upper back planted against the bench, rotate your arms outward until you feel a massive stretch in your biceps. Go light on these and instead focus on feeling your biceps pull and squeeze.",
              "videoUrl": "https://www.youtube.com/watch?v=Z0NIYS9nyoQ",
              "substitutions": [
                "DB Incline Curl",
                "Bayesian Cable Curl"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "2": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cross-Body Lat Pull-Around",
              "target": "Back (Lats)",
              "weight": "RPE 9-10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=8W67lZ5mwTU",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Neutral-Grip Pullup"
              ]
            },
            {
              "name": "Snatch-Grip RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 6-7",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=CenC1xVpMvI",
              "substitutions": [
                "DB RDL",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Straight-Bar Lat Prayer",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward to get a big stretch on the lats at the top of the ROM and then stand upright as you squeeze your lats at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=YrcnBlH8XDA",
              "substitutions": [
                "Machine Lat Pullover",
                "DB Lat Pullover"
              ]
            },
            {
              "name": "Hammer Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These will target the brachialis and forearms hard. Squeeze the dumbbell hard in the middle of the handle and curl about 3/4 of the way up (i.e. stay in the bottom 3/4 of the curl).",
              "videoUrl": "https://www.youtube.com/watch?v=dEdnC3ca-Yg",
              "substitutions": [
                "Fat-Grip Preacher Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Lying Paused Rope Face Pull",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard!",
              "videoUrl": "https://www.youtube.com/watch?v=jTmI3Q1iQUk",
              "substitutions": [
                "Rope Face Pull",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up and out in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline Smith Machine Press",
              "target": "Chest",
              "weight": "RPE 9-10",
              "reps": "8-10",
              "sets": "4",
              "notes": "Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=2ITgeRy2z2s",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline DB Press"
              ]
            },
            {
              "name": "Pec Deck (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Set up the pec deck to allow for maximum stretch. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=NPa8YvUg4CM",
              "substitutions": [
                "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8",
              "sets": "3",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Smith Machine JM Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "2",
              "notes": "Lower the bar down to your chin. Think of the movement as a combination of a skull crusher and a close-grip bench press.",
              "videoUrl": "https://www.youtube.com/watch?v=zv5bwzjN1Q4",
              "substitutions": [
                "Barbell JM Press",
                "Close-Grip Bench Press"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Hack Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=TWUnnDK8rck",
              "substitutions": [
                "Machine Squat",
                "Front Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "Leg Press Calf Press",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=S6DTPNZ_-F4",
              "substitutions": [
                "Donkey Calf Raise",
                "Seated Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Bayesian Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm. Take the weaker arm to an RPE of 9-10. Then match the reps with the other arm (stop once you've matched the reps, even if the RPE is lower). If you don't have a size imbalance, do these both arms at the same time.",
              "videoUrl": "https://www.youtube.com/watch?v=CWH5J_7kzjM",
              "substitutions": [
                "DB Incline Curl",
                "DB Scott Curl"
              ]
            },
            {
              "name": "Seated DB French Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10",
              "sets": "3",
              "notes": "Place both palms under the head of a dumbbell and perform overhead extensions. Feel a deep stretch on your triceps at the bottom. Avoid pausing at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=5KX0EjOTMaI",
              "substitutions": [
                "EZ-bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bottom-2/3 Constant Tension Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Stay in the bottom 2/3 of the curl. Don't squeeze all the way up to the top. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=vHBedP8oeCA",
              "substitutions": [
                "Bottom-2/3 EZ-Bar Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "Bench Dip",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Super-ROM Overhand Cable Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set up a wide grip pulldown bar on a seated cable row. Using a double overhand grip, perform rows while leaning forward on the negative and then extend your torso to be upright as you finish the row.",
              "videoUrl": "https://www.youtube.com/watch?v=a7AH8W7dQIw",
              "substitutions": [
                "Overhand Machine Row",
                "Arm-Out Single-Arm DB Row"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Lean-Back Lat Pulldown",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Initiate the pulldown with a straight up posture. As you pull the bar down, lean back by about 15-30° to get the mid-back more involved. Softly touch the bar to your chest on every rep and, even though you're leaning back, still control the weight!",
              "videoUrl": "https://www.youtube.com/watch?v=Zjzt4MRbAlc",
              "substitutions": [
                "Lean-Back Machine Pulldown",
                "Medium-Grip Pull Up"
              ]
            },
            {
              "name": "Inverse DB Zottman Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Do a hammer curl on the positive, then turn your palms facing up at the top and use a palms-up grip on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=jBIvbpyb99M",
              "substitutions": [
                "Slow-Eccentric DB Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Reverse Flye (Mechanical Dropset)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "5,4,3+",
              "sets": "3",
              "notes": "You'll probably want to watch the video for this one. Take ~3 big steps back from the cable machine and do your first 5 reps. After those first 5 reps, immediately (without resting) take 1 step forward and do another 4 reps. Then (without resting) take another step forward and do at least another 3 reps (or until you hit RPE 9-10).",
              "videoUrl": "https://www.youtube.com/watch?v=nN5RV1arpfM",
              "substitutions": [
                "Reverse Pec Deck",
                "Bent-Over Reverse DB Flye"
              ]
            },
            {
              "name": "Cable Paused Shrug-In",
              "target": "Back (Traps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Shrug up and in. Think about shrugging \"up to your ears\". 1-2 second pause in the squeeze (at the top) of each rep, then another 1-2 second pause in the stretch (at the bottom) of each rep.",
              "substitutions": [
                "Machine Shrug",
                "DB Shrug"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Machine Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps.",
              "videoUrl": "https://www.youtube.com/watch?v=SCQVmN1gYsk",
              "substitutions": [
                "Cable Shoulder Press",
                "Seated DB Shoulder Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Paused Assisted Dip",
              "target": "Chest/Triceps",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Slow 2-3 second negative. 1-2 second pause at the bottom. Explode with control on the way up. Go as deep as your shoulders comfortably allow, trying to at least break a 90° elbow angle.",
              "videoUrl": "https://www.youtube.com/watch?v=RyGOGviYWts",
              "substitutions": [
                "Decline Machine Chest Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Low-Incline Dumbbell Flye",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "2",
              "notes": "Focus on feeling a deep stretch in your pecs at the bottom of each rep. Keep the dumbbells in the bottom ~3/4 of the range of motion as there will be no tension on the pecs at the top. We are including these because the dumbbells' resistance profile really accentuates the stretch.",
              "videoUrl": "https://www.youtube.com/watch?v=gfIx0U5bTMA",
              "substitutions": [
                "Low-To-High Cable Crossover",
                "Pec Deck"
              ]
            },
            {
              "name": "Katana Triceps Extension",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions.",
              "videoUrl": "https://www.youtube.com/watch?v=R7f45Mv7yyg",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB French Press"
              ]
            },
            {
              "name": "Ab Wheel Rollout",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Don't just bend at your hips, use your abs to lower yourself down under control and pull yourself back up. If you don't have the core strength to get all the way extended at the bottom, try to progressively increase the ROM week to week.",
              "videoUrl": "https://www.youtube.com/watch?v=gGTgyCU9gcg",
              "substitutions": [
                "Swiss Ball Rollout",
                "LLPT Plank"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Leg Press",
              "target": "Legs (Quads)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep. Try to add a little weight each week at the same rep count.",
              "videoUrl": "https://www.youtube.com/watch?v=1yKAQLVV_XI",
              "substitutions": [
                "Belt Squat",
                "High-Bar Back Squat"
              ]
            },
            {
              "name": "Smith Machine Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 9-10",
              "reps": "8",
              "sets": "2",
              "notes": "2 sets each leg. Minimize contribution from the back leg. Mind-muscle connection with your glutes here!",
              "videoUrl": "https://www.youtube.com/watch?v=SEjKxJGg_C8",
              "substitutions": [
                "Barbell Lunge",
                "DB Step Up"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Sissy Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow yourself to come up onto your toes and push your knees forward past your toes. This is safe for the knees. If you feel knee pain doing them, though, feel free to go with a substitution. They may feel awkward at first, but they're really underrated for the quads! Don't give up on them too quickly.",
              "videoUrl": "https://www.youtube.com/watch?v=eWAjlO4FWPQ",
              "substitutions": [
                "Leg Extension",
                "Goblet Squat"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Leg Press Calf Press",
                "Donkey Calf Raise"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Cable Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow the cable to move back behind your head for maximum stretch on the triceps. Reach full extension with your elbows still around eye level at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=L3lMBRwsFlw",
              "substitutions": [
                "EZ-Bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Kneeling Overhead Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Kneel down, stick your arm straight out to the side and do cable curls. You should feel a tight squeeze at the top of each rep on these.",
              "videoUrl": "https://www.youtube.com/watch?v=KokUK4RgsHc",
              "substitutions": [
                "Overhead Cable Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Incline DB Stretch-Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Keep your upper back planted against the bench, rotate your arms outward until you feel a massive stretch in your biceps. Go light on these and instead focus on feeling your biceps pull and squeeze.",
              "videoUrl": "https://www.youtube.com/watch?v=Z0NIYS9nyoQ",
              "substitutions": [
                "DB Incline Curl",
                "Bayesian Cable Curl"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "3": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cross-Body Lat Pull-Around",
              "target": "Back (Lats)",
              "weight": "RPE 9-10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=8W67lZ5mwTU",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Neutral-Grip Pullup"
              ]
            },
            {
              "name": "Snatch-Grip RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 6-7",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=CenC1xVpMvI",
              "substitutions": [
                "DB RDL",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Straight-Bar Lat Prayer",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward to get a big stretch on the lats at the top of the ROM and then stand upright as you squeeze your lats at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=YrcnBlH8XDA",
              "substitutions": [
                "Machine Lat Pullover",
                "DB Lat Pullover"
              ]
            },
            {
              "name": "Hammer Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These will target the brachialis and forearms hard. Squeeze the dumbbell hard in the middle of the handle and curl about 3/4 of the way up (i.e. stay in the bottom 3/4 of the curl).",
              "videoUrl": "https://www.youtube.com/watch?v=dEdnC3ca-Yg",
              "substitutions": [
                "Fat-Grip Preacher Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Lying Paused Rope Face Pull",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard!",
              "videoUrl": "https://www.youtube.com/watch?v=jTmI3Q1iQUk",
              "substitutions": [
                "Rope Face Pull",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up and out in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline Smith Machine Press",
              "target": "Chest",
              "weight": "RPE 9-10",
              "reps": "8-10",
              "sets": "4",
              "notes": "Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=2ITgeRy2z2s",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline DB Press"
              ]
            },
            {
              "name": "Pec Deck (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Set up the pec deck to allow for maximum stretch. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=NPa8YvUg4CM",
              "substitutions": [
                "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8",
              "sets": "3",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week at the set rep target. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Hack Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=TWUnnDK8rck",
              "substitutions": [
                "Machine Squat",
                "Front Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "Leg Press Calf Press",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=S6DTPNZ_-F4",
              "substitutions": [
                "Donkey Calf Raise",
                "Seated Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Bayesian Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm. Take the weaker arm to an RPE of 9-10. Then match the reps with the other arm (stop once you've matched the reps, even if the RPE is lower). If you don't have a size imbalance, do these both arms at the same time.",
              "videoUrl": "https://www.youtube.com/watch?v=CWH5J_7kzjM",
              "substitutions": [
                "DB Incline Curl",
                "DB Scott Curl"
              ]
            },
            {
              "name": "Seated DB French Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10",
              "sets": "3",
              "notes": "Place both palms under the head of a dumbbell and perform overhead extensions. Feel a deep stretch on your triceps at the bottom. Avoid pausing at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=5KX0EjOTMaI",
              "substitutions": [
                "EZ-bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bottom-2/3 Constant Tension Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Stay in the bottom 2/3 of the curl. Don't squeeze all the way up to the top. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=vHBedP8oeCA",
              "substitutions": [
                "Bottom-2/3 EZ-Bar Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "Bench Dip",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Super-ROM Overhand Cable Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set up a wide grip pulldown bar on a seated cable row. Using a double overhand grip, perform rows while leaning forward on the negative and then extend your torso to be upright as you finish the row.",
              "videoUrl": "https://www.youtube.com/watch?v=a7AH8W7dQIw",
              "substitutions": [
                "Overhand Machine Row",
                "Arm-Out Single-Arm DB Row"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Lean-Back Lat Pulldown",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Initiate the pulldown with a straight up posture. As you pull the bar down, lean back by about 15-30° to get the mid-back more involved. Softly touch the bar to your chest on every rep and, even though you're leaning back, still control the weight!",
              "videoUrl": "https://www.youtube.com/watch?v=Zjzt4MRbAlc",
              "substitutions": [
                "Lean-Back Machine Pulldown",
                "Medium-Grip Pull Up"
              ]
            },
            {
              "name": "Inverse DB Zottman Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Do a hammer curl on the positive, then turn your palms facing up at the top and use a palms-up grip on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=jBIvbpyb99M",
              "substitutions": [
                "Slow-Eccentric DB Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Reverse Flye (Mechanical Dropset)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "5,4,3+",
              "sets": "3",
              "notes": "You'll probably want to watch the video for this one. Take ~3 big steps back from the cable machine and do your first 5 reps. After those first 5 reps, immediately (without resting) take 1 step forward and do another 4 reps. Then (without resting) take another step forward and do at least another 3 reps (or until you hit RPE 9-10).",
              "videoUrl": "https://www.youtube.com/watch?v=nN5RV1arpfM",
              "substitutions": [
                "Reverse Pec Deck",
                "Bent-Over Reverse DB Flye"
              ]
            },
            {
              "name": "Cable Paused Shrug-In",
              "target": "Back (Traps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Shrug up and in. Think about shrugging \"up to your ears\". 1-2 second pause in the squeeze (at the top) of each rep, then another 1-2 second pause in the stretch (at the bottom) of each rep.",
              "substitutions": [
                "Machine Shrug",
                "DB Shrug"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Machine Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps.",
              "videoUrl": "https://www.youtube.com/watch?v=SCQVmN1gYsk",
              "substitutions": [
                "Cable Shoulder Press",
                "Seated DB Shoulder Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Paused Assisted Dip",
              "target": "Chest/Triceps",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Slow 2-3 second negative. 1-2 second pause at the bottom. Explode with control on the way up. Go as deep as your shoulders comfortably allow, trying to at least break a 90° elbow angle.",
              "videoUrl": "https://www.youtube.com/watch?v=RyGOGviYWts",
              "substitutions": [
                "Decline Machine Chest Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Low-Incline Dumbbell Flye",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "2",
              "notes": "Focus on feeling a deep stretch in your pecs at the bottom of each rep. Keep the dumbbells in the bottom ~3/4 of the range of motion as there will be no tension on the pecs at the top. We are including these because the dumbbells' resistance profile really accentuates the stretch.",
              "videoUrl": "https://www.youtube.com/watch?v=gfIx0U5bTMA",
              "substitutions": [
                "Low-To-High Cable Crossover",
                "Pec Deck"
              ]
            },
            {
              "name": "Katana Triceps Extension",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions.",
              "videoUrl": "https://www.youtube.com/watch?v=R7f45Mv7yyg",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB French Press"
              ]
            },
            {
              "name": "Ab Wheel Rollout",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Don't just bend at your hips, use your abs to lower yourself down under control and pull yourself back up. If you don't have the core strength to get all the way extended at the bottom, try to progressively increase the ROM week to week.",
              "videoUrl": "https://www.youtube.com/watch?v=gGTgyCU9gcg",
              "substitutions": [
                "Swiss Ball Rollout",
                "LLPT Plank"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Leg Press",
              "target": "Legs (Quads)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep. Try to add a little weight each week at the same rep count.",
              "videoUrl": "https://www.youtube.com/watch?v=1yKAQLVV_XI",
              "substitutions": [
                "Belt Squat",
                "High-Bar Back Squat"
              ]
            },
            {
              "name": "Smith Machine Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 9-10",
              "reps": "8",
              "sets": "2",
              "notes": "2 sets each leg. Minimize contribution from the back leg. Mind-muscle connection with your glutes here!",
              "videoUrl": "https://www.youtube.com/watch?v=SEjKxJGg_C8",
              "substitutions": [
                "Barbell Lunge",
                "DB Step Up"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Sissy Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow yourself to come up onto your toes and push your knees forward past your toes. This is safe for the knees. If you feel knee pain doing them, though, feel free to go with a substitution. They may feel awkward at first, but they're really underrated for the quads! Don't give up on them too quickly.",
              "videoUrl": "https://www.youtube.com/watch?v=eWAjlO4FWPQ",
              "substitutions": [
                "Leg Extension",
                "Goblet Squat"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Leg Press Calf Press",
                "Donkey Calf Raise"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Cable Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow the cable to move back behind your head for maximum stretch on the triceps. Reach full extension with your elbows still around eye level at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=L3lMBRwsFlw",
              "substitutions": [
                "EZ-Bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Kneeling Overhead Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Kneel down, stick your arm straight out to the side and do cable curls. You should feel a tight squeeze at the top of each rep on these.",
              "videoUrl": "https://www.youtube.com/watch?v=KokUK4RgsHc",
              "substitutions": [
                "Overhead Cable Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Incline DB Stretch-Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Keep your upper back planted against the bench, rotate your arms outward until you feel a massive stretch in your biceps. Go light on these and instead focus on feeling your biceps pull and squeeze.",
              "videoUrl": "https://www.youtube.com/watch?v=Z0NIYS9nyoQ",
              "substitutions": [
                "DB Incline Curl",
                "Bayesian Cable Curl"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "4": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cross-Body Lat Pull-Around",
              "target": "Back (Lats)",
              "weight": "RPE 9-10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=8W67lZ5mwTU",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Neutral-Grip Pullup"
              ]
            },
            {
              "name": "Snatch-Grip RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 6-7",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=CenC1xVpMvI",
              "substitutions": [
                "DB RDL",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Straight-Bar Lat Prayer",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward to get a big stretch on the lats at the top of the ROM and then stand upright as you squeeze your lats at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=YrcnBlH8XDA",
              "substitutions": [
                "Machine Lat Pullover",
                "DB Lat Pullover"
              ]
            },
            {
              "name": "Hammer Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These will target the brachialis and forearms hard. Squeeze the dumbbell hard in the middle of the handle and curl about 3/4 of the way up (i.e. stay in the bottom 3/4 of the curl).",
              "videoUrl": "https://www.youtube.com/watch?v=dEdnC3ca-Yg",
              "substitutions": [
                "Fat-Grip Preacher Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Lying Paused Rope Face Pull",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard!",
              "videoUrl": "https://www.youtube.com/watch?v=jTmI3Q1iQUk",
              "substitutions": [
                "Rope Face Pull",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up and out in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline Smith Machine Press",
              "target": "Chest",
              "weight": "RPE 9-10",
              "reps": "8-10",
              "sets": "4",
              "notes": "Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=2ITgeRy2z2s",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline DB Press"
              ]
            },
            {
              "name": "Pec Deck (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Set up the pec deck to allow for maximum stretch. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=NPa8YvUg4CM",
              "substitutions": [
                "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8",
              "sets": "3",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Smith Machine JM Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "2",
              "notes": "Lower the bar down to your chin. Think of the movement as a combination of a skull crusher and a close-grip bench press.",
              "videoUrl": "https://www.youtube.com/watch?v=zv5bwzjN1Q4",
              "substitutions": [
                "Barbell JM Press",
                "Close-Grip Bench Press"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Hack Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=TWUnnDK8rck",
              "substitutions": [
                "Machine Squat",
                "Front Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "Leg Press Calf Press",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=S6DTPNZ_-F4",
              "substitutions": [
                "Donkey Calf Raise",
                "Seated Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Bayesian Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm. Take the weaker arm to an RPE of 9-10. Then match the reps with the other arm (stop once you've matched the reps, even if the RPE is lower). If you don't have a size imbalance, do these both arms at the same time.",
              "videoUrl": "https://www.youtube.com/watch?v=CWH5J_7kzjM",
              "substitutions": [
                "DB Incline Curl",
                "DB Scott Curl"
              ]
            },
            {
              "name": "Seated DB French Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10",
              "sets": "3",
              "notes": "Place both palms under the head of a dumbbell and perform overhead extensions. Feel a deep stretch on your triceps at the bottom. Avoid pausing at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=5KX0EjOTMaI",
              "substitutions": [
                "EZ-bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bottom-2/3 Constant Tension Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Stay in the bottom 2/3 of the curl. Don't squeeze all the way up to the top. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=vHBedP8oeCA",
              "substitutions": [
                "Bottom-2/3 EZ-Bar Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "Bench Dip",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Super-ROM Overhand Cable Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set up a wide grip pulldown bar on a seated cable row. Using a double overhand grip, perform rows while leaning forward on the negative and then extend your torso to be upright as you finish the row.",
              "videoUrl": "https://www.youtube.com/watch?v=a7AH8W7dQIw",
              "substitutions": [
                "Overhand Machine Row",
                "Arm-Out Single-Arm DB Row"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Lean-Back Lat Pulldown",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Initiate the pulldown with a straight up posture. As you pull the bar down, lean back by about 15-30° to get the mid-back more involved. Softly touch the bar to your chest on every rep and, even though you're leaning back, still control the weight!",
              "videoUrl": "https://www.youtube.com/watch?v=Zjzt4MRbAlc",
              "substitutions": [
                "Lean-Back Machine Pulldown",
                "Medium-Grip Pull Up"
              ]
            },
            {
              "name": "Inverse DB Zottman Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Do a hammer curl on the positive, then turn your palms facing up at the top and use a palms-up grip on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=jBIvbpyb99M",
              "substitutions": [
                "Slow-Eccentric DB Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Reverse Flye (Mechanical Dropset)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "5,4,3+",
              "sets": "3",
              "notes": "You'll probably want to watch the video for this one. Take ~3 big steps back from the cable machine and do your first 5 reps. After those first 5 reps, immediately (without resting) take 1 step forward and do another 4 reps. Then (without resting) take another step forward and do at least another 3 reps (or until you hit RPE 9-10).",
              "videoUrl": "https://www.youtube.com/watch?v=nN5RV1arpfM",
              "substitutions": [
                "Reverse Pec Deck",
                "Bent-Over Reverse DB Flye"
              ]
            },
            {
              "name": "Cable Paused Shrug-In",
              "target": "Back (Traps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Shrug up and in. Think about shrugging \"up to your ears\". 1-2 second pause in the squeeze (at the top) of each rep, then another 1-2 second pause in the stretch (at the bottom) of each rep.",
              "substitutions": [
                "Machine Shrug",
                "DB Shrug"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Machine Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps.",
              "videoUrl": "https://www.youtube.com/watch?v=SCQVmN1gYsk",
              "substitutions": [
                "Cable Shoulder Press",
                "Seated DB Shoulder Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Paused Assisted Dip",
              "target": "Chest/Triceps",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Slow 2-3 second negative. 1-2 second pause at the bottom. Explode with control on the way up. Go as deep as your shoulders comfortably allow, trying to at least break a 90° elbow angle.",
              "videoUrl": "https://www.youtube.com/watch?v=RyGOGviYWts",
              "substitutions": [
                "Decline Machine Chest Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Low-Incline Dumbbell Flye",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "2",
              "notes": "Focus on feeling a deep stretch in your pecs at the bottom of each rep. Keep the dumbbells in the bottom ~3/4 of the range of motion as there will be no tension on the pecs at the top. We are including these because the dumbbells' resistance profile really accentuates the stretch.",
              "videoUrl": "https://www.youtube.com/watch?v=gfIx0U5bTMA",
              "substitutions": [
                "Low-To-High Cable Crossover",
                "Pec Deck"
              ]
            },
            {
              "name": "Katana Triceps Extension",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions.",
              "videoUrl": "https://www.youtube.com/watch?v=R7f45Mv7yyg",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB French Press"
              ]
            },
            {
              "name": "Ab Wheel Rollout",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Don't just bend at your hips, use your abs to lower yourself down under control and pull yourself back up. If you don't have the core strength to get all the way extended at the bottom, try to progressively increase the ROM week to week.",
              "videoUrl": "https://www.youtube.com/watch?v=gGTgyCU9gcg",
              "substitutions": [
                "Swiss Ball Rollout",
                "LLPT Plank"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Leg Press",
              "target": "Legs (Quads)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep. Try to add a little weight each week at the same rep count.",
              "videoUrl": "https://www.youtube.com/watch?v=1yKAQLVV_XI",
              "substitutions": [
                "Belt Squat",
                "High-Bar Back Squat"
              ]
            },
            {
              "name": "Smith Machine Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 9-10",
              "reps": "8",
              "sets": "2",
              "notes": "2 sets each leg. Minimize contribution from the back leg. Mind-muscle connection with your glutes here!",
              "videoUrl": "https://www.youtube.com/watch?v=SEjKxJGg_C8",
              "substitutions": [
                "Barbell Lunge",
                "DB Step Up"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Sissy Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow yourself to come up onto your toes and push your knees forward past your toes. This is safe for the knees. If you feel knee pain doing them, though, feel free to go with a substitution. They may feel awkward at first, but they're really underrated for the quads! Don't give up on them too quickly.",
              "videoUrl": "https://www.youtube.com/watch?v=eWAjlO4FWPQ",
              "substitutions": [
                "Leg Extension",
                "Goblet Squat"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Leg Press Calf Press",
                "Donkey Calf Raise"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Cable Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Allow the cable to move back behind your head for maximum stretch on the triceps. Reach full extension with your elbows still around eye level at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=L3lMBRwsFlw",
              "substitutions": [
                "EZ-Bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Kneeling Overhead Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Kneel down, stick your arm straight out to the side and do cable curls. You should feel a tight squeeze at the top of each rep on these.",
              "videoUrl": "https://www.youtube.com/watch?v=KokUK4RgsHc",
              "substitutions": [
                "Overhead Cable Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Incline DB Stretch-Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Keep your upper back planted against the bench, rotate your arms outward until you feel a massive stretch in your biceps. Go light on these and instead focus on feeling your biceps pull and squeeze.",
              "videoUrl": "https://www.youtube.com/watch?v=Z0NIYS9nyoQ",
              "substitutions": [
                "DB Incline Curl",
                "Bayesian Cable Curl"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "5": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cross-Body Lat Pull-Around",
              "target": "Back (Lats)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=8W67lZ5mwTU",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Neutral-Grip Pullup"
              ]
            },
            {
              "name": "Snatch-Grip RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "1",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=CenC1xVpMvI",
              "substitutions": [
                "DB RDL",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 7-8",
              "reps": "8-10",
              "sets": "2",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Straight-Bar Lat Prayer",
              "target": "Back (Lats)",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "2",
              "notes": "Lean forward to get a big stretch on the lats at the top of the ROM and then stand upright as you squeeze your lats at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=YrcnBlH8XDA",
              "substitutions": [
                "Machine Lat Pullover",
                "DB Lat Pullover"
              ]
            },
            {
              "name": "Hammer Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "These will target the brachialis and forearms hard. Squeeze the dumbbell hard in the middle of the handle and curl about 3/4 of the way up (i.e. stay in the bottom 3/4 of the curl).",
              "videoUrl": "https://www.youtube.com/watch?v=dEdnC3ca-Yg",
              "substitutions": [
                "Fat-Grip Preacher Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Lying Paused Rope Face Pull",
              "target": "Shoulders (Rear)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard!",
              "videoUrl": "https://www.youtube.com/watch?v=jTmI3Q1iQUk",
              "substitutions": [
                "Rope Face Pull",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Raise the cables up and out in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline Smith Machine Press",
              "target": "Chest",
              "weight": "RPE 7-8",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=2ITgeRy2z2s",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline DB Press"
              ]
            },
            {
              "name": "Pec Deck (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "2",
              "notes": "Set up the pec deck to allow for maximum stretch. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=NPa8YvUg4CM",
              "substitutions": [
                "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "8-10",
              "sets": "1",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week at the set rep target. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8-10",
              "sets": "2",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Hack Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "4, 6, 8",
              "sets": "2",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=TWUnnDK8rck",
              "substitutions": [
                "Machine Squat",
                "Front Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "Leg Press Calf Press",
              "target": "Calves",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "2",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=S6DTPNZ_-F4",
              "substitutions": [
                "Donkey Calf Raise",
                "Seated Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 7-8",
              "reps": "8-12",
              "sets": "2",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 7-8",
              "reps": "8-12",
              "sets": "1",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Bayesian Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm. Take the weaker arm to an RPE of 9-10. Then match the reps with the other arm (stop once you've matched the reps, even if the RPE is lower). If you don't have a size imbalance, do these both arms at the same time.",
              "videoUrl": "https://www.youtube.com/watch?v=CWH5J_7kzjM",
              "substitutions": [
                "DB Incline Curl",
                "DB Scott Curl"
              ]
            },
            {
              "name": "Seated DB French Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "10",
              "sets": "2",
              "notes": "Place both palms under the head of a dumbbell and perform overhead extensions. Feel a deep stretch on your triceps at the bottom. Avoid pausing at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=5KX0EjOTMaI",
              "substitutions": [
                "EZ-bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bottom-2/3 Constant Tension Preacher Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "1",
              "notes": "Stay in the bottom 2/3 of the curl. Don't squeeze all the way up to the top. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=vHBedP8oeCA",
              "substitutions": [
                "Bottom-2/3 EZ-Bar Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "1",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "Bench Dip",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 7-8",
              "reps": "10-20",
              "sets": "2",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Super-ROM Overhand Cable Row",
              "target": "Back (Mid)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Set up a wide grip pulldown bar on a seated cable row. Using a double overhand grip, perform rows while leaning forward on the negative and then extend your torso to be upright as you finish the row.",
              "videoUrl": "https://www.youtube.com/watch?v=a7AH8W7dQIw",
              "substitutions": [
                "Overhand Machine Row",
                "Arm-Out Single-Arm DB Row"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 7-8",
              "reps": "10-20",
              "sets": "1",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Lean-Back Lat Pulldown",
              "target": "Back (Lats)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Initiate the pulldown with a straight up posture. As you pull the bar down, lean back by about 15-30° to get the mid-back more involved. Softly touch the bar to your chest on every rep and, even though you're leaning back, still control the weight!",
              "videoUrl": "https://www.youtube.com/watch?v=Zjzt4MRbAlc",
              "substitutions": [
                "Lean-Back Machine Pulldown",
                "Medium-Grip Pull Up"
              ]
            },
            {
              "name": "Inverse DB Zottman Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Do a hammer curl on the positive, then turn your palms facing up at the top and use a palms-up grip on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=jBIvbpyb99M",
              "substitutions": [
                "Slow-Eccentric DB Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Reverse Flye (Mechanical Dropset)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 7-8",
              "reps": "5,4,3+",
              "sets": "2",
              "notes": "You'll probably want to watch the video for this one. Take ~3 big steps back from the cable machine and do your first 5 reps. After those first 5 reps, immediately (without resting) take 1 step forward and do another 4 reps. Then (without resting) take another step forward and do at least another 3 reps (or until you hit RPE 9-10).",
              "videoUrl": "https://www.youtube.com/watch?v=nN5RV1arpfM",
              "substitutions": [
                "Reverse Pec Deck",
                "Bent-Over Reverse DB Flye"
              ]
            },
            {
              "name": "Cable Paused Shrug-In",
              "target": "Back (Traps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Shrug up and in. Think about shrugging \"up to your ears\". 1-2 second pause in the squeeze (at the top) of each rep, then another 1-2 second pause in the stretch (at the bottom) of each rep.",
              "substitutions": [
                "Machine Shrug",
                "DB Shrug"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Machine Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps.",
              "videoUrl": "https://www.youtube.com/watch?v=SCQVmN1gYsk",
              "substitutions": [
                "Cable Shoulder Press",
                "Seated DB Shoulder Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Paused Assisted Dip",
              "target": "Chest/Triceps",
              "weight": "RPE 7-8",
              "reps": "8-10",
              "sets": "2",
              "notes": "Slow 2-3 second negative. 1-2 second pause at the bottom. Explode with control on the way up. Go as deep as your shoulders comfortably allow, trying to at least break a 90° elbow angle.",
              "videoUrl": "https://www.youtube.com/watch?v=RyGOGviYWts",
              "substitutions": [
                "Decline Machine Chest Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Low-Incline Dumbbell Flye",
              "target": "Chest",
              "weight": "RPE 7-8",
              "reps": "15-20",
              "sets": "1",
              "notes": "Focus on feeling a deep stretch in your pecs at the bottom of each rep. Keep the dumbbells in the bottom ~3/4 of the range of motion as there will be no tension on the pecs at the top. We are including these because the dumbbells' resistance profile really accentuates the stretch.",
              "videoUrl": "https://www.youtube.com/watch?v=gfIx0U5bTMA",
              "substitutions": [
                "Low-To-High Cable Crossover",
                "Pec Deck"
              ]
            },
            {
              "name": "Katana Triceps Extension",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions.",
              "videoUrl": "https://www.youtube.com/watch?v=R7f45Mv7yyg",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB French Press"
              ]
            },
            {
              "name": "Ab Wheel Rollout",
              "target": "Abs",
              "weight": "RPE 7-8",
              "reps": "10-20",
              "sets": "2",
              "notes": "Don't just bend at your hips, use your abs to lower yourself down under control and pull yourself back up. If you don't have the core strength to get all the way extended at the bottom, try to progressively increase the ROM week to week.",
              "videoUrl": "https://www.youtube.com/watch?v=gGTgyCU9gcg",
              "substitutions": [
                "Swiss Ball Rollout",
                "LLPT Plank"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8-10",
              "sets": "2",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Leg Press",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep. Try to add a little weight each week at the same rep count.",
              "videoUrl": "https://www.youtube.com/watch?v=1yKAQLVV_XI",
              "substitutions": [
                "Belt Squat",
                "High-Bar Back Squat"
              ]
            },
            {
              "name": "Smith Machine Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "1",
              "notes": "2 sets each leg. Minimize contribution from the back leg. Mind-muscle connection with your glutes here!",
              "videoUrl": "https://www.youtube.com/watch?v=SEjKxJGg_C8",
              "substitutions": [
                "Barbell Lunge",
                "DB Step Up"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Sissy Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Allow yourself to come up onto your toes and push your knees forward past your toes. This is safe for the knees. If you feel knee pain doing them, though, feel free to go with a substitution. They may feel awkward at first, but they're really underrated for the quads! Don't give up on them too quickly.",
              "videoUrl": "https://www.youtube.com/watch?v=eWAjlO4FWPQ",
              "substitutions": [
                "Leg Extension",
                "Goblet Squat"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Leg Press Calf Press",
                "Donkey Calf Raise"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 7-8",
              "reps": "8-12",
              "sets": "2",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 7-8",
              "reps": "8-12",
              "sets": "1",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Cable Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Allow the cable to move back behind your head for maximum stretch on the triceps. Reach full extension with your elbows still around eye level at the top.",
              "videoUrl": "https://www.youtube.com/watch?v=L3lMBRwsFlw",
              "substitutions": [
                "EZ-Bar Skull Crusher",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Kneeling Overhead Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Kneel down, stick your arm straight out to the side and do cable curls. You should feel a tight squeeze at the top of each rep on these.",
              "videoUrl": "https://www.youtube.com/watch?v=KokUK4RgsHc",
              "substitutions": [
                "Overhead Cable Curl",
                "Spider Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "1",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Incline DB Stretch-Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 7-8",
              "reps": "12-15",
              "sets": "1",
              "notes": "Keep your upper back planted against the bench, rotate your arms outward until you feel a massive stretch in your biceps. Go light on these and instead focus on feeling your biceps pull and squeeze.",
              "videoUrl": "https://www.youtube.com/watch?v=Z0NIYS9nyoQ",
              "substitutions": [
                "DB Incline Curl",
                "Bayesian Cable Curl"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 7-8",
              "reps": "10-12",
              "sets": "2",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "6": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lat-Focused Cable Row",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Keep your torso locked in a fixed position (don't lean forward on the negative). Drive your elbows down and back to engage the lats. Keep your elbows tucked in to your sides.",
              "videoUrl": "https://www.youtube.com/watch?v=w11Kqjm-ycE",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Elbows-In 1-Arm DB Row"
              ]
            },
            {
              "name": "Paused Barbell RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=74uXdbCYZQY",
              "substitutions": [
                "Paused DB RDL",
                "Glute-Ham Raise"
              ]
            },
            {
              "name": "Chest-Supported T-Bar Row + Kelso Shrug",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10 + 4-6",
              "sets": "3",
              "notes": "Do 8-10 reps as a normal T-Bar row, driving your elbows back at roughly 45° and squeezing your shoulder blades together. Without resting, do another 4-6 reps as Kelso Shrugs (just squeeze your shoulder blades together without rowing all the way back with your arms).",
              "videoUrl": "https://www.youtube.com/watch?v=qsmjaYao9pA",
              "substitutions": [
                "Machine Chest-Supported Row + Kelso Shrug",
                "Incline Chest-Supported DB Row + Kelso Shrug"
              ]
            },
            {
              "name": "1-Arm Lat Pull-In",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Pull the cable in from the side. Keep a mind-muscle connection with your lats and try to prevent your biceps from taking over. Palpate (feel) your lats with your other hand if that helps you connect with them better.",
              "videoUrl": "https://www.youtube.com/watch?v=RMGuHVQKOms",
              "substitutions": [
                "Wide-Grip Lat Pulldown",
                "Wide-Grip Band-Assisted Pull-Up"
              ]
            },
            {
              "name": "N1-Style Short-Head Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Brace against your knee with your non-working hand and curl across your body, toward your opposite shoulder.",
              "videoUrl": "https://www.youtube.com/watch?v=qpzwJd7mr3Y",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Reverse Pec Deck (w/ Integrated Partials)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-15",
              "sets": "3",
              "notes": "Sweep the weight out instead of pulling the weight back. Mind-muscle connection with rear delts. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=KDeYqB9GYeg",
              "substitutions": [
                "Reverse Cable Flye (w/ Integrated Partials)",
                "Bent-Over Reverse DB Flye (w/ Integrated Partials)"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline DB Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the bench at a ~15° incline. Do a slight elbow tuck on the negative and then flare as you push (assuming this doesn't bother your shoulders). Nice, smooth reps here. No pausing at the top or bottom: constant tension on the pecs!",
              "videoUrl": "https://www.youtube.com/watch?v=YmlMsvNGTKA",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline Barbell Press"
              ]
            },
            {
              "name": "Dual-Cable Triceps Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Hold the cables without a handle and get them into position just above your shoulders (around chin level). Press the weight forward (straight out in front of you), not up overhead like in a standard overhead triceps extension.",
              "videoUrl": "https://www.youtube.com/watch?v=SNcQJjXWa_E",
              "substitutions": [
                "Overhead Cable Triceps Extension (Bar)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward until your torso is parallel with the floor, flye straight out and down toward the floor. Stretch and squeeze the pecs! Stay locked in.",
              "videoUrl": "https://www.youtube.com/watch?v=DKaKmnB0BO8",
              "substitutions": [
                "Pec Deck (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Deficit Pushup",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "AMRAP",
              "sets": "1",
              "notes": "Slow negative with a deep stretch at the bottom of each rep before exploding back up on the positive.",
              "videoUrl": "https://www.youtube.com/watch?v=3AZSudcQ1N0",
              "substitutions": [
                "Close-Grip Push Up",
                "Bodyweight Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Smith Machine Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=lWIEZ6NxPMk",
              "substitutions": [
                "Machine Squat",
                "DB Bulgarian Split Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "DB Calf Jumps",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Hold a dumbbell and perform a jumping motion without actually leaving the floor, using a slight knee bend, but mostly relying on your calves/ankles to drive the \"jump\". I believe I built a lot of calf mass by doing jump rope; these are meant to provide a similar stimulus, but with more tension.",
              "substitutions": [
                "Leg Press Calf Jumps",
                "Standing Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Slow-Eccentric EZ-Bar Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative. Arc the EZ-bar slightly back behind your head. When you extend, keep the bar back behind your eye line. Use the inside (closer) grip option and allow the elbows to flare to a degree that feels comfortable.",
              "videoUrl": "https://www.youtube.com/watch?v=opVMIWzaNFY",
              "substitutions": [
                "Slow-Eccentric DB Skull Crusher",
                "Slow-Eccentric DB French Press"
              ]
            },
            {
              "name": "Slow-Eccentric Bayesian Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative and a slight pause at the bottom of each rep to emphasize stretching your biceps.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Slow-Eccentric DB Incline Curl",
                "Slow-Eccentric DB Scott Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Reverse-Grip Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Grab a cable bar with your palms facing down and perform curls. These will work the back of your forearm, brachialis and biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=xtZvYrfw2Is",
              "substitutions": [
                "Reverse-Grip EZ-Bar Curl",
                "Reverse-Grip DB Curl"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Dual-Handle Lat Pulldown (Mid-back + Lats)",
              "target": "Back",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Lean back by ~15° and drive your elbows down as you squeeze your shoulder blades together. This should feel like a mix of lats and mid-traps.",
              "videoUrl": "https://www.youtube.com/watch?v=NwQ5Ch5t5Vk",
              "substitutions": [
                "Overhand Lat Pulldown",
                "Pull-Up"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Concentration Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Place your working elbow against your knee and perform strict form curls.",
              "videoUrl": "https://www.youtube.com/watch?v=BFZyW_7ld0c",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Rear Delt 45° Cable Flye",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Pull with one arm at a time, bracing with your non-working hand against the machine. Try to align your arm and the cable in a straight line at the bottom of the flye.",
              "videoUrl": "https://www.youtube.com/watch?v=8iXorduqXC8",
              "substitutions": [
                "DB Rear Delt Swing",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated DB Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Slightly rotate the dumbbells in on the negative and flare your elbows out as you push.",
              "videoUrl": "https://www.youtube.com/watch?v=B8PB5RPhTWQ",
              "substitutions": [
                "Seated Barbell Shoulder Press",
                "Standing DB Arnold Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Decline Machine Chest Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Feel your pecs stretching apart on the negative. Mind-muscle connection with lower pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=AABuMGK9H28",
              "substitutions": [
                "Decline Smith Machine Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Stomach Vacuums",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-15 sec hold",
              "sets": "2",
              "notes": "Suck your stomach in and hold it for 10-15 seconds, repeat 2x.",
              "videoUrl": "https://www.youtube.com/watch?v=dyFeDqVApFU",
              "substitutions": [
                "LLPT Plank",
                "Ab Wheel Rollout"
              ]
            },
            {
              "name": "Super-ROM DB Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Perform lateral raises as normal, except going until your hands are up overhead. As you break parallel, you will use more upper traps to move the weight. Feel free to squeeze your upper traps at the top. If you feel shoulder pain when going all the way up, try pointing your thumb up or simply stop at parallel and do normal lateral raises.",
              "videoUrl": "https://www.youtube.com/watch?v=RyztKrzaMNk",
              "substitutions": [
                "Cable Upright Row",
                "DB Lateral Raise"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Smith Machine Reverse Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Set one leg back on the negative and then drive the weight up using your front leg. Try to minimize assistance from your back leg.",
              "videoUrl": "https://www.youtube.com/watch?v=D0KZo_gBsw0",
              "substitutions": [
                "DB Reverse Lunge",
                "DB Walking Lunge"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "4",
              "notes": "Set the seat back as far as it will go. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "Reverse Nordic",
                "Sissy Squats"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Machine Hip Abduction",
              "target": "Legs (Abductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
              "videoUrl": "https://www.youtube.com/watch?v=Jq4YWyLSh_o",
              "substitutions": [
                "Cable Hip Abduction",
                "Lateral Band Walk"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Seated Calf Raise",
                "Leg Press Calf Press"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Fat-Grip DB Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Squeeze the dumbbell hard in the middle of the handle as you curl. Using liquid chalk on these will prevent your grip from slipping, keeping your hand in the middle of the handle throughout the set (as opposed to resting against the head of the dumbbell).",
              "videoUrl": "https://www.youtube.com/watch?v=AE49-Oqh-0w",
              "substitutions": [
                "Inverse DB Zottman Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "DB Triceps Kickback",
                "Triceps Pressdown (Rope)"
              ]
            },
            {
              "name": "Medicine Ball Russian Twists",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep the ball held out far from your body on the sides and control the reps, don't just rush through them to get the set done.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Half-Kneeling Pallof Press",
                "Bicycle Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "7": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lat-Focused Cable Row",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Keep your torso locked in a fixed position (don't lean forward on the negative). Drive your elbows down and back to engage the lats. Keep your elbows tucked in to your sides.",
              "videoUrl": "https://www.youtube.com/watch?v=w11Kqjm-ycE",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Elbows-In 1-Arm DB Row"
              ]
            },
            {
              "name": "Paused Barbell RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=74uXdbCYZQY",
              "substitutions": [
                "Paused DB RDL",
                "Glute-Ham Raise"
              ]
            },
            {
              "name": "Chest-Supported T-Bar Row + Kelso Shrug",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10 + 4-6",
              "sets": "3",
              "notes": "Do 8-10 reps as a normal T-Bar row, driving your elbows back at roughly 45° and squeezing your shoulder blades together. Without resting, do another 4-6 reps as Kelso Shrugs (just squeeze your shoulder blades together without rowing all the way back with your arms).",
              "videoUrl": "https://www.youtube.com/watch?v=qsmjaYao9pA",
              "substitutions": [
                "Machine Chest-Supported Row + Kelso Shrug",
                "Incline Chest-Supported DB Row + Kelso Shrug"
              ]
            },
            {
              "name": "1-Arm Lat Pull-In",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Pull the cable in from the side. Keep a mind-muscle connection with your lats and try to prevent your biceps from taking over. Palpate (feel) your lats with your other hand if that helps you connect with them better.",
              "videoUrl": "https://www.youtube.com/watch?v=RMGuHVQKOms",
              "substitutions": [
                "Wide-Grip Lat Pulldown",
                "Wide-Grip Band-Assisted Pull-Up"
              ]
            },
            {
              "name": "N1-Style Short-Head Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Brace against your knee with your non-working hand and curl across your body, toward your opposite shoulder.",
              "videoUrl": "https://www.youtube.com/watch?v=qpzwJd7mr3Y",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Reverse Pec Deck (w/ Integrated Partials)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-15",
              "sets": "3",
              "notes": "Sweep the weight out instead of pulling the weight back. Mind-muscle connection with rear delts. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=KDeYqB9GYeg",
              "substitutions": [
                "Reverse Cable Flye (w/ Integrated Partials)",
                "Bent-Over Reverse DB Flye (w/ Integrated Partials)"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline DB Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the bench at a ~15° incline. Do a slight elbow tuck on the negative and then flare as you push (assuming this doesn't bother your shoulders). Nice, smooth reps here. No pausing at the top or bottom: constant tension on the pecs!",
              "videoUrl": "https://www.youtube.com/watch?v=YmlMsvNGTKA",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline Barbell Press"
              ]
            },
            {
              "name": "Dual-Cable Triceps Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Hold the cables without a handle and get them into position just above your shoulders (around chin level). Press the weight forward (straight out in front of you), not up overhead like in a standard overhead triceps extension.",
              "videoUrl": "https://www.youtube.com/watch?v=SNcQJjXWa_E",
              "substitutions": [
                "Overhead Cable Triceps Extension (Bar)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward until your torso is parallel with the floor, flye straight out and down toward the floor. Stretch and squeeze the pecs! Stay locked in.",
              "videoUrl": "https://www.youtube.com/watch?v=DKaKmnB0BO8",
              "substitutions": [
                "Pec Deck (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Deficit Pushup",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "AMRAP",
              "sets": "1",
              "notes": "Slow negative with a deep stretch at the bottom of each rep before exploding back up on the positive.",
              "videoUrl": "https://www.youtube.com/watch?v=3AZSudcQ1N0",
              "substitutions": [
                "Close-Grip Push Up",
                "Bodyweight Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Smith Machine Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=lWIEZ6NxPMk",
              "substitutions": [
                "Machine Squat",
                "DB Bulgarian Split Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "DB Calf Jumps",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Hold a dumbbell and perform a jumping motion without actually leaving the floor, using a slight knee bend, but mostly relying on your calves/ankles to drive the \"jump\". I believe I built a lot of calf mass by doing jump rope; these are meant to provide a similar stimulus, but with more tension.",
              "substitutions": [
                "Leg Press Calf Jumps",
                "Standing Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Slow-Eccentric EZ-Bar Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative. Arc the EZ-bar slightly back behind your head. When you extend, keep the bar back behind your eye line. Use the inside (closer) grip option and allow the elbows to flare to a degree that feels comfortable.",
              "videoUrl": "https://www.youtube.com/watch?v=opVMIWzaNFY",
              "substitutions": [
                "Slow-Eccentric DB Skull Crusher",
                "Slow-Eccentric DB French Press"
              ]
            },
            {
              "name": "Slow-Eccentric Bayesian Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative and a slight pause at the bottom of each rep to emphasize stretching your biceps.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Slow-Eccentric DB Incline Curl",
                "Slow-Eccentric DB Scott Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Reverse-Grip Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Grab a cable bar with your palms facing down and perform curls. These will work the back of your forearm, brachialis and biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=xtZvYrfw2Is",
              "substitutions": [
                "Reverse-Grip EZ-Bar Curl",
                "Reverse-Grip DB Curl"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Dual-Handle Lat Pulldown (Mid-back + Lats)",
              "target": "Back",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Lean back by ~15° and drive your elbows down as you squeeze your shoulder blades together. This should feel like a mix of lats and mid-traps.",
              "videoUrl": "https://www.youtube.com/watch?v=NwQ5Ch5t5Vk",
              "substitutions": [
                "Overhand Lat Pulldown",
                "Pull-Up"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Concentration Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Place your working elbow against your knee and perform strict form curls.",
              "videoUrl": "https://www.youtube.com/watch?v=BFZyW_7ld0c",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Rear Delt 45° Cable Flye",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Pull with one arm at a time, bracing with your non-working hand against the machine. Try to align your arm and the cable in a straight line at the bottom of the flye.",
              "videoUrl": "https://www.youtube.com/watch?v=8iXorduqXC8",
              "substitutions": [
                "DB Rear Delt Swing",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated DB Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Slightly rotate the dumbbells in on the negative and flare your elbows out as you push.",
              "videoUrl": "https://www.youtube.com/watch?v=B8PB5RPhTWQ",
              "substitutions": [
                "Seated Barbell Shoulder Press",
                "Standing DB Arnold Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Decline Machine Chest Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Feel your pecs stretching apart on the negative. Mind-muscle connection with lower pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=AABuMGK9H28",
              "substitutions": [
                "Decline Smith Machine Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Stomach Vacuums",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-15 sec hold",
              "sets": "2",
              "notes": "Suck your stomach in and hold it for 10-15 seconds, repeat 2x.",
              "videoUrl": "https://www.youtube.com/watch?v=dyFeDqVApFU",
              "substitutions": [
                "LLPT Plank",
                "Ab Wheel Rollout"
              ]
            },
            {
              "name": "Super-ROM DB Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Perform lateral raises as normal, except going until your hands are up overhead. As you break parallel, you will use more upper traps to move the weight. Feel free to squeeze your upper traps at the top. If you feel shoulder pain when going all the way up, try pointing your thumb up or simply stop at parallel and do normal lateral raises.",
              "videoUrl": "https://www.youtube.com/watch?v=RyztKrzaMNk",
              "substitutions": [
                "Cable Upright Row",
                "DB Lateral Raise"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Smith Machine Reverse Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Set one leg back on the negative and then drive the weight up using your front leg. Try to minimize assistance from your back leg.",
              "videoUrl": "https://www.youtube.com/watch?v=D0KZo_gBsw0",
              "substitutions": [
                "DB Reverse Lunge",
                "DB Walking Lunge"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "4",
              "notes": "Set the seat back as far as it will go. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "Reverse Nordic",
                "Sissy Squats"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Machine Hip Abduction",
              "target": "Legs (Abductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
              "videoUrl": "https://www.youtube.com/watch?v=Jq4YWyLSh_o",
              "substitutions": [
                "Cable Hip Abduction",
                "Lateral Band Walk"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Seated Calf Raise",
                "Leg Press Calf Press"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Fat-Grip DB Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Squeeze the dumbbell hard in the middle of the handle as you curl. Using liquid chalk on these will prevent your grip from slipping, keeping your hand in the middle of the handle throughout the set (as opposed to resting against the head of the dumbbell).",
              "videoUrl": "https://www.youtube.com/watch?v=AE49-Oqh-0w",
              "substitutions": [
                "Inverse DB Zottman Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "DB Triceps Kickback",
                "Triceps Pressdown (Rope)"
              ]
            },
            {
              "name": "Medicine Ball Russian Twists",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep the ball held out far from your body on the sides and control the reps, don't just rush through them to get the set done.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Half-Kneeling Pallof Press",
                "Bicycle Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "8": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lat-Focused Cable Row",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Keep your torso locked in a fixed position (don't lean forward on the negative). Drive your elbows down and back to engage the lats. Keep your elbows tucked in to your sides.",
              "videoUrl": "https://www.youtube.com/watch?v=w11Kqjm-ycE",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Elbows-In 1-Arm DB Row"
              ]
            },
            {
              "name": "Paused Barbell RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=74uXdbCYZQY",
              "substitutions": [
                "Paused DB RDL",
                "Glute-Ham Raise"
              ]
            },
            {
              "name": "Chest-Supported T-Bar Row + Kelso Shrug",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10 + 4-6",
              "sets": "3",
              "notes": "Do 8-10 reps as a normal T-Bar row, driving your elbows back at roughly 45° and squeezing your shoulder blades together. Without resting, do another 4-6 reps as Kelso Shrugs (just squeeze your shoulder blades together without rowing all the way back with your arms).",
              "videoUrl": "https://www.youtube.com/watch?v=qsmjaYao9pA",
              "substitutions": [
                "Machine Chest-Supported Row + Kelso Shrug",
                "Incline Chest-Supported DB Row + Kelso Shrug"
              ]
            },
            {
              "name": "1-Arm Lat Pull-In",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Pull the cable in from the side. Keep a mind-muscle connection with your lats and try to prevent your biceps from taking over. Palpate (feel) your lats with your other hand if that helps you connect with them better.",
              "videoUrl": "https://www.youtube.com/watch?v=RMGuHVQKOms",
              "substitutions": [
                "Wide-Grip Lat Pulldown",
                "Wide-Grip Band-Assisted Pull-Up"
              ]
            },
            {
              "name": "N1-Style Short-Head Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Brace against your knee with your non-working hand and curl across your body, toward your opposite shoulder.",
              "videoUrl": "https://www.youtube.com/watch?v=qpzwJd7mr3Y",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Reverse Pec Deck (w/ Integrated Partials)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-15",
              "sets": "3",
              "notes": "Sweep the weight out instead of pulling the weight back. Mind-muscle connection with rear delts. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=KDeYqB9GYeg",
              "substitutions": [
                "Reverse Cable Flye (w/ Integrated Partials)",
                "Bent-Over Reverse DB Flye (w/ Integrated Partials)"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline DB Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the bench at a ~15° incline. Do a slight elbow tuck on the negative and then flare as you push (assuming this doesn't bother your shoulders). Nice, smooth reps here. No pausing at the top or bottom: constant tension on the pecs!",
              "videoUrl": "https://www.youtube.com/watch?v=YmlMsvNGTKA",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline Barbell Press"
              ]
            },
            {
              "name": "Dual-Cable Triceps Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Hold the cables without a handle and get them into position just above your shoulders (around chin level). Press the weight forward (straight out in front of you), not up overhead like in a standard overhead triceps extension.",
              "videoUrl": "https://www.youtube.com/watch?v=SNcQJjXWa_E",
              "substitutions": [
                "Overhead Cable Triceps Extension (Bar)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward until your torso is parallel with the floor, flye straight out and down toward the floor. Stretch and squeeze the pecs! Stay locked in.",
              "videoUrl": "https://www.youtube.com/watch?v=DKaKmnB0BO8",
              "substitutions": [
                "Pec Deck (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Deficit Pushup",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "AMRAP",
              "sets": "1",
              "notes": "Slow negative with a deep stretch at the bottom of each rep before exploding back up on the positive.",
              "videoUrl": "https://www.youtube.com/watch?v=3AZSudcQ1N0",
              "substitutions": [
                "Close-Grip Push Up",
                "Bodyweight Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Smith Machine Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=lWIEZ6NxPMk",
              "substitutions": [
                "Machine Squat",
                "DB Bulgarian Split Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "DB Calf Jumps",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Hold a dumbbell and perform a jumping motion without actually leaving the floor, using a slight knee bend, but mostly relying on your calves/ankles to drive the \"jump\". I believe I built a lot of calf mass by doing jump rope; these are meant to provide a similar stimulus, but with more tension.",
              "substitutions": [
                "Leg Press Calf Jumps",
                "Standing Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Slow-Eccentric EZ-Bar Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative. Arc the EZ-bar slightly back behind your head. When you extend, keep the bar back behind your eye line. Use the inside (closer) grip option and allow the elbows to flare to a degree that feels comfortable.",
              "videoUrl": "https://www.youtube.com/watch?v=opVMIWzaNFY",
              "substitutions": [
                "Slow-Eccentric DB Skull Crusher",
                "Slow-Eccentric DB French Press"
              ]
            },
            {
              "name": "Slow-Eccentric Bayesian Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative and a slight pause at the bottom of each rep to emphasize stretching your biceps.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Slow-Eccentric DB Incline Curl",
                "Slow-Eccentric DB Scott Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Reverse-Grip Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Grab a cable bar with your palms facing down and perform curls. These will work the back of your forearm, brachialis and biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=xtZvYrfw2Is",
              "substitutions": [
                "Reverse-Grip EZ-Bar Curl",
                "Reverse-Grip DB Curl"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Dual-Handle Lat Pulldown (Mid-back + Lats)",
              "target": "Back",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Lean back by ~15° and drive your elbows down as you squeeze your shoulder blades together. This should feel like a mix of lats and mid-traps.",
              "videoUrl": "https://www.youtube.com/watch?v=NwQ5Ch5t5Vk",
              "substitutions": [
                "Overhand Lat Pulldown",
                "Pull-Up"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Concentration Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Place your working elbow against your knee and perform strict form curls.",
              "videoUrl": "https://www.youtube.com/watch?v=BFZyW_7ld0c",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Rear Delt 45° Cable Flye",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Pull with one arm at a time, bracing with your non-working hand against the machine. Try to align your arm and the cable in a straight line at the bottom of the flye.",
              "videoUrl": "https://www.youtube.com/watch?v=8iXorduqXC8",
              "substitutions": [
                "DB Rear Delt Swing",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated DB Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Slightly rotate the dumbbells in on the negative and flare your elbows out as you push.",
              "videoUrl": "https://www.youtube.com/watch?v=B8PB5RPhTWQ",
              "substitutions": [
                "Seated Barbell Shoulder Press",
                "Standing DB Arnold Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Decline Machine Chest Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Feel your pecs stretching apart on the negative. Mind-muscle connection with lower pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=AABuMGK9H28",
              "substitutions": [
                "Decline Smith Machine Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Stomach Vacuums",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-15 sec hold",
              "sets": "2",
              "notes": "Suck your stomach in and hold it for 10-15 seconds, repeat 2x.",
              "videoUrl": "https://www.youtube.com/watch?v=dyFeDqVApFU",
              "substitutions": [
                "LLPT Plank",
                "Ab Wheel Rollout"
              ]
            },
            {
              "name": "Super-ROM DB Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Perform lateral raises as normal, except going until your hands are up overhead. As you break parallel, you will use more upper traps to move the weight. Feel free to squeeze your upper traps at the top. If you feel shoulder pain when going all the way up, try pointing your thumb up or simply stop at parallel and do normal lateral raises.",
              "videoUrl": "https://www.youtube.com/watch?v=RyztKrzaMNk",
              "substitutions": [
                "Cable Upright Row",
                "DB Lateral Raise"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Smith Machine Reverse Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Set one leg back on the negative and then drive the weight up using your front leg. Try to minimize assistance from your back leg.",
              "videoUrl": "https://www.youtube.com/watch?v=D0KZo_gBsw0",
              "substitutions": [
                "DB Reverse Lunge",
                "DB Walking Lunge"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "4",
              "notes": "Set the seat back as far as it will go. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "Reverse Nordic",
                "Sissy Squats"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Machine Hip Abduction",
              "target": "Legs (Abductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
              "videoUrl": "https://www.youtube.com/watch?v=Jq4YWyLSh_o",
              "substitutions": [
                "Cable Hip Abduction",
                "Lateral Band Walk"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Seated Calf Raise",
                "Leg Press Calf Press"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Fat-Grip DB Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Squeeze the dumbbell hard in the middle of the handle as you curl. Using liquid chalk on these will prevent your grip from slipping, keeping your hand in the middle of the handle throughout the set (as opposed to resting against the head of the dumbbell).",
              "videoUrl": "https://www.youtube.com/watch?v=AE49-Oqh-0w",
              "substitutions": [
                "Inverse DB Zottman Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "DB Triceps Kickback",
                "Triceps Pressdown (Rope)"
              ]
            },
            {
              "name": "Medicine Ball Russian Twists",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep the ball held out far from your body on the sides and control the reps, don't just rush through them to get the set done.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Half-Kneeling Pallof Press",
                "Bicycle Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "9": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lat-Focused Cable Row",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Keep your torso locked in a fixed position (don't lean forward on the negative). Drive your elbows down and back to engage the lats. Keep your elbows tucked in to your sides.",
              "videoUrl": "https://www.youtube.com/watch?v=w11Kqjm-ycE",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Elbows-In 1-Arm DB Row"
              ]
            },
            {
              "name": "Paused Barbell RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=74uXdbCYZQY",
              "substitutions": [
                "Paused DB RDL",
                "Glute-Ham Raise"
              ]
            },
            {
              "name": "Chest-Supported T-Bar Row + Kelso Shrug",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10 + 4-6",
              "sets": "3",
              "notes": "Do 8-10 reps as a normal T-Bar row, driving your elbows back at roughly 45° and squeezing your shoulder blades together. Without resting, do another 4-6 reps as Kelso Shrugs (just squeeze your shoulder blades together without rowing all the way back with your arms).",
              "videoUrl": "https://www.youtube.com/watch?v=qsmjaYao9pA",
              "substitutions": [
                "Machine Chest-Supported Row + Kelso Shrug",
                "Incline Chest-Supported DB Row + Kelso Shrug"
              ]
            },
            {
              "name": "1-Arm Lat Pull-In",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Pull the cable in from the side. Keep a mind-muscle connection with your lats and try to prevent your biceps from taking over. Palpate (feel) your lats with your other hand if that helps you connect with them better.",
              "videoUrl": "https://www.youtube.com/watch?v=RMGuHVQKOms",
              "substitutions": [
                "Wide-Grip Lat Pulldown",
                "Wide-Grip Band-Assisted Pull-Up"
              ]
            },
            {
              "name": "N1-Style Short-Head Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Brace against your knee with your non-working hand and curl across your body, toward your opposite shoulder.",
              "videoUrl": "https://www.youtube.com/watch?v=qpzwJd7mr3Y",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Reverse Pec Deck (w/ Integrated Partials)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-15",
              "sets": "3",
              "notes": "Sweep the weight out instead of pulling the weight back. Mind-muscle connection with rear delts. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=KDeYqB9GYeg",
              "substitutions": [
                "Reverse Cable Flye (w/ Integrated Partials)",
                "Bent-Over Reverse DB Flye (w/ Integrated Partials)"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline DB Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the bench at a ~15° incline. Do a slight elbow tuck on the negative and then flare as you push (assuming this doesn't bother your shoulders). Nice, smooth reps here. No pausing at the top or bottom: constant tension on the pecs!",
              "videoUrl": "https://www.youtube.com/watch?v=YmlMsvNGTKA",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline Barbell Press"
              ]
            },
            {
              "name": "Dual-Cable Triceps Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Hold the cables without a handle and get them into position just above your shoulders (around chin level). Press the weight forward (straight out in front of you), not up overhead like in a standard overhead triceps extension.",
              "videoUrl": "https://www.youtube.com/watch?v=SNcQJjXWa_E",
              "substitutions": [
                "Overhead Cable Triceps Extension (Bar)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward until your torso is parallel with the floor, flye straight out and down toward the floor. Stretch and squeeze the pecs! Stay locked in.",
              "videoUrl": "https://www.youtube.com/watch?v=DKaKmnB0BO8",
              "substitutions": [
                "Pec Deck (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Deficit Pushup",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "AMRAP",
              "sets": "1",
              "notes": "Slow negative with a deep stretch at the bottom of each rep before exploding back up on the positive.",
              "videoUrl": "https://www.youtube.com/watch?v=3AZSudcQ1N0",
              "substitutions": [
                "Close-Grip Push Up",
                "Bodyweight Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Smith Machine Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=lWIEZ6NxPMk",
              "substitutions": [
                "Machine Squat",
                "DB Bulgarian Split Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "DB Calf Jumps",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Hold a dumbbell and perform a jumping motion without actually leaving the floor, using a slight knee bend, but mostly relying on your calves/ankles to drive the \"jump\". I believe I built a lot of calf mass by doing jump rope; these are meant to provide a similar stimulus, but with more tension.",
              "substitutions": [
                "Leg Press Calf Jumps",
                "Standing Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Slow-Eccentric EZ-Bar Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative. Arc the EZ-bar slightly back behind your head. When you extend, keep the bar back behind your eye line. Use the inside (closer) grip option and allow the elbows to flare to a degree that feels comfortable.",
              "videoUrl": "https://www.youtube.com/watch?v=opVMIWzaNFY",
              "substitutions": [
                "Slow-Eccentric DB Skull Crusher",
                "Slow-Eccentric DB French Press"
              ]
            },
            {
              "name": "Slow-Eccentric Bayesian Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative and a slight pause at the bottom of each rep to emphasize stretching your biceps.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Slow-Eccentric DB Incline Curl",
                "Slow-Eccentric DB Scott Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Reverse-Grip Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Grab a cable bar with your palms facing down and perform curls. These will work the back of your forearm, brachialis and biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=xtZvYrfw2Is",
              "substitutions": [
                "Reverse-Grip EZ-Bar Curl",
                "Reverse-Grip DB Curl"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Dual-Handle Lat Pulldown (Mid-back + Lats)",
              "target": "Back",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Lean back by ~15° and drive your elbows down as you squeeze your shoulder blades together. This should feel like a mix of lats and mid-traps.",
              "videoUrl": "https://www.youtube.com/watch?v=NwQ5Ch5t5Vk",
              "substitutions": [
                "Overhand Lat Pulldown",
                "Pull-Up"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Concentration Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Place your working elbow against your knee and perform strict form curls.",
              "videoUrl": "https://www.youtube.com/watch?v=BFZyW_7ld0c",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Rear Delt 45° Cable Flye",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Pull with one arm at a time, bracing with your non-working hand against the machine. Try to align your arm and the cable in a straight line at the bottom of the flye.",
              "videoUrl": "https://www.youtube.com/watch?v=8iXorduqXC8",
              "substitutions": [
                "DB Rear Delt Swing",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated DB Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Slightly rotate the dumbbells in on the negative and flare your elbows out as you push.",
              "videoUrl": "https://www.youtube.com/watch?v=B8PB5RPhTWQ",
              "substitutions": [
                "Seated Barbell Shoulder Press",
                "Standing DB Arnold Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Decline Machine Chest Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Feel your pecs stretching apart on the negative. Mind-muscle connection with lower pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=AABuMGK9H28",
              "substitutions": [
                "Decline Smith Machine Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Stomach Vacuums",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-15 sec hold",
              "sets": "2",
              "notes": "Suck your stomach in and hold it for 10-15 seconds, repeat 2x.",
              "videoUrl": "https://www.youtube.com/watch?v=dyFeDqVApFU",
              "substitutions": [
                "LLPT Plank",
                "Ab Wheel Rollout"
              ]
            },
            {
              "name": "Super-ROM DB Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Perform lateral raises as normal, except going until your hands are up overhead. As you break parallel, you will use more upper traps to move the weight. Feel free to squeeze your upper traps at the top. If you feel shoulder pain when going all the way up, try pointing your thumb up or simply stop at parallel and do normal lateral raises.",
              "videoUrl": "https://www.youtube.com/watch?v=RyztKrzaMNk",
              "substitutions": [
                "Cable Upright Row",
                "DB Lateral Raise"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Smith Machine Reverse Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Set one leg back on the negative and then drive the weight up using your front leg. Try to minimize assistance from your back leg.",
              "videoUrl": "https://www.youtube.com/watch?v=D0KZo_gBsw0",
              "substitutions": [
                "DB Reverse Lunge",
                "DB Walking Lunge"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "4",
              "notes": "Set the seat back as far as it will go. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "Reverse Nordic",
                "Sissy Squats"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Machine Hip Abduction",
              "target": "Legs (Abductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
              "videoUrl": "https://www.youtube.com/watch?v=Jq4YWyLSh_o",
              "substitutions": [
                "Cable Hip Abduction",
                "Lateral Band Walk"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Seated Calf Raise",
                "Leg Press Calf Press"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Fat-Grip DB Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Squeeze the dumbbell hard in the middle of the handle as you curl. Using liquid chalk on these will prevent your grip from slipping, keeping your hand in the middle of the handle throughout the set (as opposed to resting against the head of the dumbbell).",
              "videoUrl": "https://www.youtube.com/watch?v=AE49-Oqh-0w",
              "substitutions": [
                "Inverse DB Zottman Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "DB Triceps Kickback",
                "Triceps Pressdown (Rope)"
              ]
            },
            {
              "name": "Medicine Ball Russian Twists",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep the ball held out far from your body on the sides and control the reps, don't just rush through them to get the set done.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Half-Kneeling Pallof Press",
                "Bicycle Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      },
      "10": {
        "days": {
          "Day 1": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lat-Focused Cable Row",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Keep your torso locked in a fixed position (don't lean forward on the negative). Drive your elbows down and back to engage the lats. Keep your elbows tucked in to your sides.",
              "videoUrl": "https://www.youtube.com/watch?v=w11Kqjm-ycE",
              "substitutions": [
                "Half-Kneeling 1-Arm Lat Pulldown",
                "Elbows-In 1-Arm DB Row"
              ]
            },
            {
              "name": "Paused Barbell RDL",
              "target": "Legs (Hams)",
              "weight": "RPE 7-8",
              "reps": "8",
              "sets": "2",
              "notes": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. 1 second pause at the bottom of each rep. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
              "videoUrl": "https://www.youtube.com/watch?v=74uXdbCYZQY",
              "substitutions": [
                "Paused DB RDL",
                "Glute-Ham Raise"
              ]
            },
            {
              "name": "Chest-Supported T-Bar Row + Kelso Shrug",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10 + 4-6",
              "sets": "3",
              "notes": "Do 8-10 reps as a normal T-Bar row, driving your elbows back at roughly 45° and squeezing your shoulder blades together. Without resting, do another 4-6 reps as Kelso Shrugs (just squeeze your shoulder blades together without rowing all the way back with your arms).",
              "videoUrl": "https://www.youtube.com/watch?v=qsmjaYao9pA",
              "substitutions": [
                "Machine Chest-Supported Row + Kelso Shrug",
                "Incline Chest-Supported DB Row + Kelso Shrug"
              ]
            },
            {
              "name": "1-Arm Lat Pull-In",
              "target": "Back (Lats)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Pull the cable in from the side. Keep a mind-muscle connection with your lats and try to prevent your biceps from taking over. Palpate (feel) your lats with your other hand if that helps you connect with them better.",
              "videoUrl": "https://www.youtube.com/watch?v=RMGuHVQKOms",
              "substitutions": [
                "Wide-Grip Lat Pulldown",
                "Wide-Grip Band-Assisted Pull-Up"
              ]
            },
            {
              "name": "N1-Style Short-Head Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Brace against your knee with your non-working hand and curl across your body, toward your opposite shoulder.",
              "videoUrl": "https://www.youtube.com/watch?v=qpzwJd7mr3Y",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Reverse Pec Deck (w/ Integrated Partials)",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "10-15",
              "sets": "3",
              "notes": "Sweep the weight out instead of pulling the weight back. Mind-muscle connection with rear delts. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/bottom half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps and an RPE of 9-10.",
              "videoUrl": "https://www.youtube.com/watch?v=KDeYqB9GYeg",
              "substitutions": [
                "Reverse Cable Flye (w/ Integrated Partials)",
                "Bent-Over Reverse DB Flye (w/ Integrated Partials)"
              ]
            }
          ],
          "Day 2": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Cuffed Behind-The-Back Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Raise the cables up in a \"Y\" motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
              "substitutions": [
                "Cross-Body Cable Y-Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Low Incline DB Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the bench at a ~15° incline. Do a slight elbow tuck on the negative and then flare as you push (assuming this doesn't bother your shoulders). Nice, smooth reps here. No pausing at the top or bottom: constant tension on the pecs!",
              "videoUrl": "https://www.youtube.com/watch?v=YmlMsvNGTKA",
              "substitutions": [
                "Low Incline Machine Press",
                "Low Incline Barbell Press"
              ]
            },
            {
              "name": "Dual-Cable Triceps Press",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Hold the cables without a handle and get them into position just above your shoulders (around chin level). Press the weight forward (straight out in front of you), not up overhead like in a standard overhead triceps extension.",
              "videoUrl": "https://www.youtube.com/watch?v=SNcQJjXWa_E",
              "substitutions": [
                "Overhead Cable Triceps Extension (Bar)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Bent-Over Cable Pec Flye (w/ Integrated Partials)",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Lean forward until your torso is parallel with the floor, flye straight out and down toward the floor. Stretch and squeeze the pecs! Stay locked in.",
              "videoUrl": "https://www.youtube.com/watch?v=DKaKmnB0BO8",
              "substitutions": [
                "Pec Deck (w/ Integrated Partials)",
                "DB Flye (w/ Integrated Partials)"
              ]
            },
            {
              "name": "Deficit Pushup",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "AMRAP",
              "sets": "1",
              "notes": "Slow negative with a deep stretch at the bottom of each rep before exploding back up on the positive.",
              "videoUrl": "https://www.youtube.com/watch?v=3AZSudcQ1N0",
              "substitutions": [
                "Close-Grip Push Up",
                "Bodyweight Dip"
              ]
            },
            {
              "name": "Cable Crunch",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
              "videoUrl": "https://www.youtube.com/watch?v=epBrpaGHMcg",
              "substitutions": [
                "Machine Crunch",
                "Plate-Weighted Crunch"
              ]
            }
          ],
          "Day 3": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Lean forward over the machine to get a maximum stretch in your hamstrings.",
              "videoUrl": "https://www.youtube.com/watch?v=yv0aAY7M1mk",
              "substitutions": [
                "Lying Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "Smith Machine Squat",
              "target": "Legs (Quads)",
              "weight": "RPE 9",
              "reps": "4, 6, 8",
              "sets": "3",
              "notes": "We're using a reverse pyramid on this exercise. Warm-up as usual to your first working set for 4 reps. This first set will be your heaviest set. Then for set 2, drop the weight back ~10-15% and do 6 reps. Then for set 3, drop the weight back another 10-15% and do 8 reps.",
              "videoUrl": "https://www.youtube.com/watch?v=lWIEZ6NxPMk",
              "substitutions": [
                "Machine Squat",
                "DB Bulgarian Split Squat"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "DB Step-Up",
                "Reverse Nordic"
              ]
            },
            {
              "name": "DB Calf Jumps",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Hold a dumbbell and perform a jumping motion without actually leaving the floor, using a slight knee bend, but mostly relying on your calves/ankles to drive the \"jump\". I believe I built a lot of calf mass by doing jump rope; these are meant to provide a similar stimulus, but with more tension.",
              "substitutions": [
                "Leg Press Calf Jumps",
                "Standing Calf Raise"
              ]
            }
          ],
          "Day 4": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Slow-Eccentric EZ-Bar Skull Crusher",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative. Arc the EZ-bar slightly back behind your head. When you extend, keep the bar back behind your eye line. Use the inside (closer) grip option and allow the elbows to flare to a degree that feels comfortable.",
              "videoUrl": "https://www.youtube.com/watch?v=opVMIWzaNFY",
              "substitutions": [
                "Slow-Eccentric DB Skull Crusher",
                "Slow-Eccentric DB French Press"
              ]
            },
            {
              "name": "Slow-Eccentric Bayesian Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Use a 3-4 second negative and a slight pause at the bottom of each rep to emphasize stretching your biceps.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Slow-Eccentric DB Incline Curl",
                "Slow-Eccentric DB Scott Curl"
              ]
            },
            {
              "name": "Triceps Diverging Pressdown (Long Rope or 2 Ropes)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Use two long ropes or one long rope. Lean slightly forward, flare your elbows slightly out and keep your arms back in line with your torso. Then do triceps pressdowns, getting a full, big squeeze at the bottom.",
              "videoUrl": "https://www.youtube.com/watch?v=20tbMlP71Nc",
              "substitutions": [
                "Cable Triceps Kickback",
                "DB Triceps Kickback"
              ]
            },
            {
              "name": "Reverse-Grip Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Grab a cable bar with your palms facing down and perform curls. These will work the back of your forearm, brachialis and biceps!",
              "videoUrl": "https://www.youtube.com/watch?v=xtZvYrfw2Is",
              "substitutions": [
                "Reverse-Grip EZ-Bar Curl",
                "Reverse-Grip DB Curl"
              ]
            },
            {
              "name": "Roman Chair Leg Raise",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "3",
              "notes": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
              "videoUrl": "https://www.youtube.com/watch?v=irOzFVqJ0IE",
              "substitutions": [
                "Hanging Leg Raise",
                "Reverse Crunch"
              ]
            }
          ],
          "Day 5": [],
          "Day 6": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Dual-Handle Lat Pulldown (Mid-back + Lats)",
              "target": "Back",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Lean back by ~15° and drive your elbows down as you squeeze your shoulder blades together. This should feel like a mix of lats and mid-traps.",
              "videoUrl": "https://www.youtube.com/watch?v=NwQ5Ch5t5Vk",
              "substitutions": [
                "Overhand Lat Pulldown",
                "Pull-Up"
              ]
            },
            {
              "name": "Arms-Extended 45° Hyperextension",
              "target": "Back (Lower)",
              "weight": "RPE 9-10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep your arms extended out at 45° as you do back extensions. You should feel a crazy burn in your mid-back and lower back.",
              "videoUrl": "https://www.youtube.com/watch?v=PrwC-5NTCCs",
              "substitutions": [
                "Prisoner 45° Hyperextension",
                "Good Morning (Light Weight)"
              ]
            },
            {
              "name": "Chest-Supported Machine Row",
              "target": "Back (Mid)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=ijsSiWSzYw0",
              "substitutions": [
                "Chest-Supported T-Bar Row",
                "Helms Row"
              ]
            },
            {
              "name": "Concentration Cable Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Place your working elbow against your knee and perform strict form curls.",
              "videoUrl": "https://www.youtube.com/watch?v=BFZyW_7ld0c",
              "substitutions": [
                "DB Concentration Curl",
                "DB Preacher Curl"
              ]
            },
            {
              "name": "Rear Delt 45° Cable Flye",
              "target": "Shoulders (Rear)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Pull with one arm at a time, bracing with your non-working hand against the machine. Try to align your arm and the cable in a straight line at the bottom of the flye.",
              "videoUrl": "https://www.youtube.com/watch?v=8iXorduqXC8",
              "substitutions": [
                "DB Rear Delt Swing",
                "Bent-Over Reverse DB Flye"
              ]
            }
          ],
          "Day 7": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Seated DB Shoulder Press",
              "target": "Shoulders",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Slightly rotate the dumbbells in on the negative and flare your elbows out as you push.",
              "videoUrl": "https://www.youtube.com/watch?v=B8PB5RPhTWQ",
              "substitutions": [
                "Seated Barbell Shoulder Press",
                "Standing DB Arnold Press"
              ]
            },
            {
              "name": "Cross-Body Cable Y-Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Think about \"drawing a sword\" as you do the positive. Sweep your arm up, out and across your body. It may take a few weeks to get used to these if you haven't done them before, but once they click, they really click.",
              "substitutions": [
                "Machine Lateral Raise",
                "DB Lateral Raise"
              ]
            },
            {
              "name": "Decline Machine Chest Press",
              "target": "Chest",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Feel your pecs stretching apart on the negative. Mind-muscle connection with lower pecs.",
              "videoUrl": "https://www.youtube.com/watch?v=AABuMGK9H28",
              "substitutions": [
                "Decline Smith Machine Press",
                "Decline Barbell Press"
              ]
            },
            {
              "name": "Overhead Cable Triceps Extension (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "2",
              "notes": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
              "videoUrl": "https://www.youtube.com/watch?v=9_I1PqZAjdA",
              "substitutions": [
                "Overhead Cable Triceps Extension (Rope)",
                "DB Skull Crusher"
              ]
            },
            {
              "name": "Stomach Vacuums",
              "target": "Abs",
              "weight": "RPE 9-10",
              "reps": "10-15 sec hold",
              "sets": "2",
              "notes": "Suck your stomach in and hold it for 10-15 seconds, repeat 2x.",
              "videoUrl": "https://www.youtube.com/watch?v=dyFeDqVApFU",
              "substitutions": [
                "LLPT Plank",
                "Ab Wheel Rollout"
              ]
            },
            {
              "name": "Super-ROM DB Lateral Raise",
              "target": "Shoulders (Side)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "3",
              "notes": "Perform lateral raises as normal, except going until your hands are up overhead. As you break parallel, you will use more upper traps to move the weight. Feel free to squeeze your upper traps at the top. If you feel shoulder pain when going all the way up, try pointing your thumb up or simply stop at parallel and do normal lateral raises.",
              "videoUrl": "https://www.youtube.com/watch?v=RyztKrzaMNk",
              "substitutions": [
                "Cable Upright Row",
                "DB Lateral Raise"
              ]
            }
          ],
          "Day 8": [
            {
              "name": "General & Specific Warm-Up",
              "target": "Full Body",
              "weight": "Light",
              "reps": "5-15",
              "sets": "3",
              "notes": "5-10 mins light cardio. Then 2-3 warm-up sets of your first exercise, gradually increasing weight (e.g., 50% x 8, 70% x 4, 90% x 1).",
              "videoUrl": "https://www.youtube.com/watch?v=tFpwBr_7KPg",
              "substitutions": []
            },
            {
              "name": "Lying Leg Curl",
              "target": "Legs (Hams)",
              "weight": "RPE 10",
              "reps": "8-10",
              "sets": "3",
              "notes": "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl.",
              "videoUrl": "https://www.youtube.com/watch?v=sX4tGtcc62k",
              "substitutions": [
                "Seated Leg Curl",
                "Nordic Ham Curl"
              ]
            },
            {
              "name": "Smith Machine Reverse Lunge",
              "target": "Legs (Quads/Glutes)",
              "weight": "RPE 8-9",
              "reps": "8",
              "sets": "3",
              "notes": "Set one leg back on the negative and then drive the weight up using your front leg. Try to minimize assistance from your back leg.",
              "videoUrl": "https://www.youtube.com/watch?v=D0KZo_gBsw0",
              "substitutions": [
                "DB Reverse Lunge",
                "DB Walking Lunge"
              ]
            },
            {
              "name": "Leg Extension",
              "target": "Legs (Quads)",
              "weight": "RPE 10",
              "reps": "15-20",
              "sets": "4",
              "notes": "Set the seat back as far as it will go. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative.",
              "videoUrl": "https://www.youtube.com/watch?v=uFbNtqP966A",
              "substitutions": [
                "Reverse Nordic",
                "Sissy Squats"
              ]
            },
            {
              "name": "A1: Machine Hip Adduction",
              "target": "Legs (Adductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front! Push them hard!",
              "videoUrl": "https://www.youtube.com/watch?v=FMSCZYu1JhE",
              "substitutions": [
                "Cable Hip Adduction",
                "Copenhagen Hip Adduction"
              ]
            },
            {
              "name": "A2: Machine Hip Abduction",
              "target": "Legs (Abductors)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
              "videoUrl": "https://www.youtube.com/watch?v=Jq4YWyLSh_o",
              "substitutions": [
                "Cable Hip Abduction",
                "Lateral Band Walk"
              ]
            },
            {
              "name": "Standing Calf Raise",
              "target": "Calves",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
              "videoUrl": "https://www.youtube.com/watch?v=6lR2JdxUh7w",
              "substitutions": [
                "Seated Calf Raise",
                "Leg Press Calf Press"
              ]
            }
          ],
          "Day 9": [
            {
              "name": "Weak Point Exercise 1",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "3",
              "notes": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Weak Point Exercise 2 (optional)",
              "target": "Weak Point",
              "weight": "RPE 9-10",
              "reps": "8-12",
              "sets": "2",
              "notes": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
              "substitutions": [
                "See The Weak Point Table for sub options"
              ]
            },
            {
              "name": "Triceps Pressdown (Bar)",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "10-12",
              "sets": "3",
              "notes": "These are meant to be fairly heavy, which is why we're using a bar instead of a rope. Aim to add some weight week to week. Always keep the form tight as you overload the triceps.",
              "videoUrl": "https://www.youtube.com/watch?v=o4eazahiXQw",
              "substitutions": [
                "Triceps Pressdown (Rope)",
                "Close-Grip Assisted Dip"
              ]
            },
            {
              "name": "Fat-Grip DB Curl",
              "target": "Arms (Biceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "Squeeze the dumbbell hard in the middle of the handle as you curl. Using liquid chalk on these will prevent your grip from slipping, keeping your hand in the middle of the handle throughout the set (as opposed to resting against the head of the dumbbell).",
              "videoUrl": "https://www.youtube.com/watch?v=AE49-Oqh-0w",
              "substitutions": [
                "Inverse DB Zottman Curl",
                "Hammer Curl"
              ]
            },
            {
              "name": "Cable Triceps Kickback",
              "target": "Arms (Triceps)",
              "weight": "RPE 10",
              "reps": "12-15",
              "sets": "2",
              "notes": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
              "videoUrl": "https://www.youtube.com/watch?v=oRxTKRtP8RE",
              "substitutions": [
                "DB Triceps Kickback",
                "Triceps Pressdown (Rope)"
              ]
            },
            {
              "name": "Medicine Ball Russian Twists",
              "target": "Abs",
              "weight": "RPE 10",
              "reps": "10-20",
              "sets": "2",
              "notes": "Keep the ball held out far from your body on the sides and control the reps, don't just rush through them to get the set done.",
              "videoUrl": "https://www.youtube.com/watch?v=eJF2gdt9PcE",
              "substitutions": [
                "Half-Kneeling Pallof Press",
                "Bicycle Crunch"
              ]
            }
          ],
          "Day 10": []
        }
      }
    }
  },
];
