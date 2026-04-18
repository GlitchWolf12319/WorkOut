import https from 'https';

export function getTitle(id: string) {
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
    console.log('D-kqUKEQZZ0:', await getTitle('D-kqUKEQZZ0'));
    console.log('KDeYqB9GYeg:', await getTitle('KDeYqB9GYeg'));
    console.log('Hy6f1Lz_PiA:', await getTitle('Hy6f1Lz_PiA'));
})();
