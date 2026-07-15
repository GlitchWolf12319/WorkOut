import React, { useState, useEffect } from 'react';

interface ExerciseVisualProps {
  name: string;
  target: string;
}

// Maps exercise names from Jeff Nippard's programs to Everkinetic muscle-highlighted illustration IDs
const EXERCISE_MAPPING: Record<string, string> = {
  // General & Warm-up
  "General & Specific Warm-Up": "0077",
  "Warm-Up": "0077",
  
  // Chest
  "Bench Press": "0042",
  "Barbell Bench Press": "0042",
  "Dumbbell Bench Press": "0055",
  "Dumbbell Chest Press": "0055",
  "Chest Press Machine": "0066",
  "Low Incline Smith Machine Press": "0081",
  "Low Incline Machine Press": "0081",
  "Low Incline DB Press": "0061",
  "Pec Deck (w/ Integrated Partials)": "0048",
  "Pec Deck": "0048",
  "Bent-Over Cable Pec Flye": "0057",
  "DB Flye": "0056",
  "Low Incline DB Flye": "0062",
  "Low-Incline Dumbbell Flye": "0062",
  "Low-To-High Cable Crossover": "0048",
  "Pushup": "0077",
  "Pushups": "0077",
  
  // Back
  "Cross-Body Lat Pull-Around": "0096",
  "Wide-Grip Lat Pulldown": "0095",
  "Half-Kneeling 1-Arm Lat Pulldown": "0096",
  "Neutral-Grip Pullup": "0090",
  "Pullup": "0087",
  "Pull-Up": "0087",
  "Pullups": "0087",
  "Medium-Grip Pull Up": "0087",
  "Chest-Supported Machine Row": "0029",
  "Chest-Supported T-Bar Row": "0029",
  "Helms Row": "0026",
  "Straight-Bar Lat Prayer": "0092",
  "Machine Lat Pullover": "0045",
  "DB Lat Pullover": "0046",
  "Super-ROM Overhand Cable Row": "0015",
  "Overhand Machine Row": "0029",
  "Arm-Out Single-Arm DB Row": "0039",
  "Lean-Back Lat Pulldown": "0096",
  "Lean-Back Machine Pulldown": "0096",
  "Cable Paused Shrug-In": "0009",
  "Machine Shrug": "0041",
  "DB Shrug": "0016",
  "Lat-Focused Cable Row": "0015",
  "Elbows-In 1-Arm DB Row": "0039",
  
  // Shoulders
  "Cuffed Behind-The-Back Lateral Raise": "0017",
  "Machine Lateral Raise": "0018",
  "Dumbbell Lateral Raise": "0018",
  "Cross-Body Cable Y-Raise": "0008",
  "Lying Paused Rope Face Pull": "0035",
  "Rope Face Pull": "0035",
  "Bent-Over Reverse DB Flye": "0023",
  "Cable Reverse Flye": "0035",
  "Reverse Pec Deck": "0035",
  "Machine Shoulder Press": "0004",
  "Cable Shoulder Press": "0004",
  "Seated DB Shoulder Press": "0031",
  "Standing DB Arnold Press": "0004",
  "Smith Machine Shoulder Press": "0004",
  
  // Legs
  "Snatch-Grip RDL": "0118",
  "DB RDL": "0118",
  "Nordic Ham Curl": "0117",
  "Seated Leg Curl": "0119",
  "Lying Leg Curl": "0117",
  "Machine Hip Adduction": "0157",
  "Cable Hip Adduction": "0135",
  "Copenhagen Hip Adduction": "0135",
  "Hack Squat": "0123",
  "Machine Squat": "0123",
  "Front Squat": "0138",
  "High-Bar Back Squat": "0122",
  "Barbell Squat": "0122",
  "Leg Extension": "0142",
  "Single-Leg Leg Extension": "0142",
  "DB Step-Up": "0137",
  "Reverse Nordic": "0158",
  "Leg Press Calf Press": "0127",
  "Donkey Calf Raise": "0275",
  "Seated Calf Raise": "0272",
  "Standing Calf Raise": "0278",
  "Leg Press": "0127",
  "Smith Machine Lunge": "0114",
  "Barbell Lunge": "0114",
  "DB Step Up": "0137",
  "Sissy Squat": "0158",
  "Barbell Hip Thrust": "0109",
  "Single-Leg DB Hip Thrust": "0109",
  "Machine Hip Abduction": "0156",
  "Lateral Band Walk": "0156",
  
  // Arms
  "Hammer Preacher Curl": "0240",
  "Fat-Grip Preacher Curl": "0217",
  "Hammer Curl": "0213",
  "Bayesian Cable Curl": "0212",
  "DB Incline Curl": "0214",
  "DB Scott Curl": "0237",
  "Bottom-2/3 Constant Tension Preacher Curl": "0217",
  "Bottom-2/3 EZ-Bar Curl": "0226",
  "Spider Curl": "0245",
  "Inverse DB Zottman Curl": "0251",
  "Slow-Eccentric DB Curl": "0223",
  "Kneeling Overhead Cable Curl": "0238",
  "Overhead Cable Curl": "0238",
  "Incline DB Stretch-Curl": "0214",
  "Barbell Curl": "0211",
  "Bicep Curl": "0211",
  
  "Overhead Cable Triceps Extension (Bar)": "0164",
  "Overhead Cable Triceps Extension (Rope)": "0164",
  "Overhead Cable Triceps Extension": "0164",
  "DB Skull Crusher": "0181",
  "Triceps Pressdown (Bar)": "0205",
  "Triceps Pressdown (Rope)": "0206",
  "Triceps Pressdown": "0205",
  "Close-Grip Assisted Dip": "0162",
  "Seated DB French Press": "0192",
  "EZ-bar Skull Crusher": "0168",
  "Cable Triceps Kickback": "0199",
  "Bench Dip": "0162",
  "DB Triceps Kickback": "0204",
  "Katana Triceps Extension": "0179",
  "Paused Assisted Dip": "0172",
  "Cable Skull Crusher": "0165",
  "Triceps Diverging Pressdown": "0205",
  "Triceps Diverging Pressdown (Long Rope or 2 Ropes)": "0206",
  
  // Abs / Core
  "Cable Crunch": "0288",
  "Machine Crunch": "0288",
  "Plate-Weighted Crunch": "0291",
  "Roman Chair Leg Raise": "0021",
  "Hanging Leg Raise": "0021",
  "Reverse Crunch": "0291",
  "Ab Wheel Rollout": "0285",
  "Swiss Ball Rollout": "0286",
  "LLPT Plank": "0113",
};

const getExerciseCategory = (name: string, target: string): string => {
  const t = (target || '').toLowerCase();
  const n = (name || '').toLowerCase();
  
  if (t.includes('shoulder') || n.includes('lateral raise') || n.includes('shoulder press') || n.includes('y-raise')) return 'shoulders';
  if (t.includes('lat') || t.includes('back (lats)') || n.includes('lat') || n.includes('pulldown') || n.includes('pull-up') || n.includes('pullup')) return 'lats';
  if (t.includes('back') || n.includes('row') || n.includes('deadlift') || n.includes('shrug')) return 'back';
  if (t.includes('chest') || t.includes('pec') || n.includes('press') || n.includes('flye') || n.includes('dips') || n.includes('pushup')) return 'chest';
  if (t.includes('quad') || t.includes('leg') || n.includes('squat') || n.includes('extension') || n.includes('press') || n.includes('lunge')) {
    if (t.includes('hams') || n.includes('curl') || n.includes('romanian')) return 'legs-posterior';
    return 'legs-anterior';
  }
  if (t.includes('glute') || t.includes('hip') || n.includes('thrust') || n.includes('abduction')) return 'glutes';
  if (t.includes('bicep') || n.includes('curl')) return 'biceps';
  if (t.includes('tricep') || n.includes('pushdown') || n.includes('overhead extension') || n.includes('skull crusher')) return 'triceps';
  if (t.includes('arm') || n.includes('wrist') || n.includes('forearm')) return 'arms';
  if (t.includes('neck')) return 'neck';
  if (t.includes('abs') || t.includes('core') || n.includes('crunch') || n.includes('plank') || n.includes('leg raise')) return 'abs';
  if (n.includes('cardio') || n.includes('treadmill') || n.includes('elliptical') || n.includes('run') || n.includes('walk') || n.includes('bike')) return 'cardio';
  return 'general';
};

const getFallbackId = (category: string): string => {
  switch (category) {
    case 'shoulders': return '0018';
    case 'lats': return '0095';
    case 'back': return '0029';
    case 'chest': return '0042';
    case 'legs-anterior': return '0122';
    case 'legs-posterior': return '0117';
    case 'glutes': return '0109';
    case 'biceps': return '0211';
    case 'triceps': return '0205';
    case 'arms': return '0223';
    case 'neck': return '0001';
    case 'abs': return '0291';
    case 'cardio': return '0116';
    default: return '0077';
  }
};

export const ExerciseVisual: React.FC<ExerciseVisualProps> = ({ name, target }) => {
  const category = getExerciseCategory(name, target);
  
  // Retrieve the Everkinetic exercise ID from mapping or use a fallback
  const mappedId = EXERCISE_MAPPING[name];
  const id = mappedId || getFallbackId(category);

  const [frame, setFrame] = useState<'relaxation' | 'tension'>('relaxation');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset loading and error states on exercise change to avoid stale state
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [name, id]);

  // Dynamic animation looping between relaxation and tension states every 1.2 seconds
  useEffect(() => {
    if (hasError) return;
    const interval = setInterval(() => {
      setFrame((f) => (f === 'relaxation' ? 'tension' : 'relaxation'));
    }, 1200);
    return () => clearInterval(interval);
  }, [hasError]);

  const imageUrl = `https://raw.githubusercontent.com/everkinetic/data/master/dist/png/${id}-${frame}.png`;

  // Pre-load the other frame to prevent flickering
  useEffect(() => {
    if (hasError) return;
    const nextFrame = frame === 'relaxation' ? 'tension' : 'relaxation';
    const nextImg = new Image();
    nextImg.src = `https://raw.githubusercontent.com/everkinetic/data/master/dist/png/${id}-${nextFrame}.png`;
  }, [frame, id, hasError]);

  const handleImageError = () => {
    setHasError(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Inline vector SVGs as fallback if the remote image fails to load, or as background highlight layer
  const renderFallbackSVG = (brightRed = false) => {
    const strokeColor = brightRed ? "rgba(255, 255, 255, 0.2)" : "var(--color-primary,currentColor)";
    const highlightColor = brightRed ? "#ef4444" : "currentColor";
    const highlightClass = brightRed ? "animate-pulse text-red-500" : "";

    const fillProps = (defaultOpacity: number) => ({
      fill: highlightColor,
      fillOpacity: brightRed ? 0.95 : defaultOpacity,
      className: highlightClass
    });

    switch (category) {
      case 'shoulders':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 3,10 L 21,10" strokeLinecap="round" />
            <rect x="4" y="6" width="2" height="8" rx="1" />
            <rect x="18" y="6" width="2" height="8" rx="1" />
            <path d="M 12,18 L 12,13" strokeLinecap="round" />
            <path d="M 10,15 L 12,13 L 14,15" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 8,20 C 8,16 16,16 16,20" strokeOpacity="0.3" strokeLinecap="round" />
            <circle cx="8" cy="14" r="1.5" {...fillProps(0.2)} stroke="none" />
            <circle cx="16" cy="14" r="1.5" {...fillProps(0.2)} stroke="none" />
          </svg>
        );
      case 'lats':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 2,6 L 7,5 L 17,5 L 22,6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 6,5 L 6,1 L 12,1 L 18,1 L 18,5" strokeDasharray="2 2" strokeOpacity="0.4" />
            <path d="M 8,14 C 6,18 7,22 7,22 M 16,14 C 18,18 17,22 17,22" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M 8,14 C 10,13 14,13 16,14 C 15,18 12,21 12,21 C 12,21 9,18 8,14 Z" {...fillProps(0.15)} />
          </svg>
        );
      case 'back':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 2,17 L 22,17" strokeLinecap="round" />
            <circle cx="4" cy="17" r="2.5" />
            <circle cx="20" cy="17" r="2.5" />
            <path d="M 12,15 L 12,7" strokeLinecap="round" />
            <path d="M 9,10 L 12,7 L 15,10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 9,21 L 12,15 L 15,21" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M 12,15 C 10,10 14,10 12,15" strokeLinecap="round" {...fillProps(0.1)} />
          </svg>
        );
      case 'chest':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 4,8 L 20,8" strokeLinecap="round" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="21" cy="8" r="1.5" />
            <path d="M 6,19 C 6,14 18,14 18,19" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M 7,15 C 8,12 11,12 11.5,15 Z" {...fillProps(0.2)} />
            <path d="M 17,15 C 16,12 13,12 12.5,15 Z" {...fillProps(0.2)} />
            <path d="M 12,13 L 12,6" strokeDasharray="2 2" strokeOpacity="0.5" />
          </svg>
        );
      case 'legs-anterior':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 12,2 L 12,10 L 16,17 L 15,22" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 12,2 C 14,5 14,9 12,10 C 10,9 10,5 12,2 Z" {...fillProps(0.2)} />
            <circle cx="12" cy="10" r="1" fill={brightRed ? "#ef4444" : "currentColor"} className={highlightClass} stroke="none" />
            <path d="M 5,5 L 19,5" strokeOpacity="0.3" strokeLinecap="round" />
          </svg>
        );
      case 'legs-posterior':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 12,2 L 12,10 L 10,18 L 11,22" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 12,3 C 10,5 10,9 12,10 Z" {...fillProps(0.2)} />
            <circle cx="12.5" cy="2.5" r="1" {...fillProps(0.3)} stroke="none" />
          </svg>
        );
      case 'glutes':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 4,18 L 11,18 L 15,12 L 20,12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="13" cy="15" r="2.5" {...fillProps(0.2)} stroke="none" />
            <path d="M 13,15 M 13,11 Q 13,18 10,18" strokeLinecap="round" />
          </svg>
        );
      case 'biceps':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 4,14 C 4,10 7,9 10,9 C 12,9 13,11 15,10 L 19,14 C 18,17 14,17 12,17 M 12,17 L 8,17" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 10,9 C 11,6 13,7 13.5,9 Z" {...fillProps(0.2)} />
            <path d="M 14,7 L 18,11" strokeLinecap="round" />
            <rect x="13" y="5" width="2" height="3" transform="rotate(45 13 5)" />
            <rect x="17" y="9" width="2" height="3" transform="rotate(45 17 9)" />
          </svg>
        );
      case 'triceps':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 8,4 L 11,10 L 11,19" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 8,4 C 10,5 11.5,7 11,10" strokeLinecap="round" />
            <path d="M 9.5,4 C 11,6 11,8 11,10 Z" {...fillProps(0.2)} />
            <path d="M 15,4 L 11,10" strokeDasharray="2 2" strokeOpacity="0.5" />
          </svg>
        );
      case 'arms':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 5,8 L 19,8" strokeLinecap="round" strokeOpacity="0.3" />
            <path d="M 8,12 L 16,12" strokeLinecap="round" />
            <path d="M 10,12 C 12,11 14,11 15,12 Z" {...fillProps(0.2)} />
          </svg>
        );
      case 'neck':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <circle cx="12" cy="7" r="4" strokeOpacity="0.3" />
            <path d="M 5,20 C 5,16 9,15 12,15 C 15,15 19,16 19,20" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M 10,11 L 10,15 L 14,15 L 14,11 Z" {...fillProps(0.2)} />
          </svg>
        );
      case 'abs':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 8,6 L 16,6 L 15,19 L 9,19 Z" strokeOpacity="0.3" strokeLinejoin="round" />
            <rect x="10" y="8" width="4" height="8" rx="0.5" strokeDasharray="1 1" />
            <path d="M 10,10 L 14,10 M 10,12 L 14,12 M 10,14 L 14,14" />
            <path d="M 12,8 L 12,16" />
            <rect x="10" y="8" width="4" height="8" rx="0.5" {...fillProps(0.15)} />
          </svg>
        );
      case 'cardio':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <path d="M 3,12 L 8,12 L 10,7 L 13,17 L 15,10 L 17,12 L 21,12" strokeLinecap="round" strokeLinejoin="round" className={highlightClass} stroke={brightRed ? "#ef4444" : "var(--color-primary,currentColor)"} />
            <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none" stroke={strokeColor} strokeWidth="1.5">
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="2" fill={brightRed ? "#ef4444" : "currentColor"} className={highlightClass} />
            <path d="M 12,2 L 12,5 M 12,19 L 12,22 M 2,12 L 5,12 M 19,12 L 22,12" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-950/80 border border-white/5 shadow-inner shrink-0 overflow-hidden text-primary-container">
      {!hasError ? (
        <>
          {/* Skeletons/Loading State */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-950/60 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
            </div>
          )}

          {/* 1. Static Custom SVG with bright red highlighted muscle as background layer */}
          <div className="absolute inset-0 flex items-center justify-center p-1 opacity-70">
            {renderFallbackSVG(true)}
          </div>

          {/* 2. Real Everkinetic Animated PNG overlaid on top with transparent blend */}
          <img
            src={imageUrl}
            alt={name}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`absolute inset-0 w-full h-full object-contain p-1.5 transition-opacity duration-300 pointer-events-none select-none ${
              isLoaded ? 'opacity-85' : 'opacity-0'
            }`}
            style={{
              filter: 'invert(0.9) brightness(1.25) contrast(1.1)',
              mixBlendMode: 'screen'
            }}
          />
        </>
      ) : (
        renderFallbackSVG(false)
      )}
    </div>
  );
};
