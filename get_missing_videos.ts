import fs from 'fs';
import { PROGRAMS } from './src/data/programs';

const missing = new Set<string>();
PROGRAMS.forEach(p => {
  if (p.weeks) {
    Object.values(p.weeks).forEach(week => {
      Object.values(week.days).forEach(day => {
        day.forEach(ex => {
          if (!ex.videoUrl && ex.name !== 'Weak Point Exercise 1' && ex.name !== 'Weak Point Exercise 2 (optional)') {
            missing.add(ex.name);
          }
        });
      });
    });
  }
});

console.log(Array.from(missing).join('\n'));
