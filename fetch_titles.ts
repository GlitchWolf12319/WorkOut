import https from 'https';

export function getTitle(id: string) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/watch?v=${id}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<title>(.*?)<\/title>/);
        resolve(match ? match[1] : 'No title');
      });
    });
  });
}

(async () => {
    console.log('D-kqUKEQZZ0:', await getTitle('D-kqUKEQZZ0'));
    console.log('KDeYqB9GYeg:', await getTitle('KDeYqB9GYeg'));
    console.log('Hy6f1Lz_PiA:', await getTitle('Hy6f1Lz_PiA'));
})();
