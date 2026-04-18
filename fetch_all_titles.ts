import https from 'https';
import fs from 'fs';
import { videoIds } from './src/videos.js';

export function getTitle(id: string): Promise<string> {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.title);
        } catch(e) {
          resolve('Unknown');
        }
      });
    });
  });
}

(async () => {
    console.log("Fetching titles for all videos...");
    const map: Record<string, string> = {};
    for (let i = 0; i < videoIds.length; i++) {
        const title = await getTitle(videoIds[i]);
        console.log(`${videoIds[i]}: ${title}`);
        map[videoIds[i]] = title;
    }
    fs.writeFileSync('./video_titles.json', JSON.stringify(map, null, 2));
})();
