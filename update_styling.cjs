const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Remove cyberpunk/aggressive styling
appTsx = appTsx.replace(/uppercase/g, '');
appTsx = appTsx.replace(/tracking-widest/g, '');
appTsx = appTsx.replace(/tracking-\[0\.2em\]/g, '');
appTsx = appTsx.replace(/tracking-tighter/g, '');
appTsx = appTsx.replace(/tracking-tight/g, '');
appTsx = appTsx.replace(/hud-border/g, '');
appTsx = appTsx.replace(/scanline-overlay/g, '');
appTsx = appTsx.replace(/font-headline/g, 'font-sans font-semibold');
appTsx = appTsx.replace(/font-black/g, 'font-bold');

// Soften borders and backgrounds
appTsx = appTsx.replace(/border-outline-variant\/10/g, 'border-white/5');
appTsx = appTsx.replace(/border-outline-variant\/20/g, 'border-white/5');
appTsx = appTsx.replace(/border-outline-variant\/30/g, 'border-white/10');
appTsx = appTsx.replace(/border-outline-variant\/60/g, 'border-white/20');
appTsx = appTsx.replace(/bg-surface-container-low/g, 'bg-[#1c1c1e]');
appTsx = appTsx.replace(/bg-surface-container-high/g, 'bg-[#2c2c2e]');
appTsx = appTsx.replace(/bg-surface-container-highest/g, 'bg-[#3a3a3c]');
appTsx = appTsx.replace(/bg-surface-container/g, 'bg-[#121212]');
appTsx = appTsx.replace(/bg-surface/g, 'bg-[#000000]');

// Round corners
appTsx = appTsx.replace(/rounded-sm/g, 'rounded-2xl');
appTsx = appTsx.replace(/rounded-none/g, 'rounded-2xl');
// Add rounded-2xl to cards that might not have it
appTsx = appTsx.replace(/className="bg-\[#1c1c1e\]/g, 'className="bg-[#1c1c1e] rounded-2xl');
appTsx = appTsx.replace(/className="bg-\[#2c2c2e\]/g, 'className="bg-[#2c2c2e] rounded-2xl');
appTsx = appTsx.replace(/className="bg-\[#3a3a3c\]/g, 'className="bg-[#3a3a3c] rounded-2xl');

// Fix any double rounded-2xl
appTsx = appTsx.replace(/rounded-2xl rounded-2xl/g, 'rounded-2xl');

// Make text sizes a bit more normal
appTsx = appTsx.replace(/text-\[8px\]/g, 'text-xs');
appTsx = appTsx.replace(/text-\[10px\]/g, 'text-sm');

fs.writeFileSync('src/App.tsx', appTsx);
console.log('Updated App.tsx styling');
