import https from 'https';

export function getTitle(id: string) {
  return new Promise((resolve) => {
    const req = https.get(`https://www.youtube.com/watch?v=${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<meta property="og:title" content="(.*?)">/);
        resolve(match ? match[1] : 'No title');
      });
    });
    req.on('error', () => resolve('Error'));
  });
}

(async () => {
    console.log('D-kqUKEQZZ0:', await getTitle('D-kqUKEQZZ0'));
    console.log('KDeYqB9GYeg:', await getTitle('KDeYqB9GYeg'));
    console.log('Hy6f1Lz_PiA:', await getTitle('Hy6f1Lz_PiA'));
})();
