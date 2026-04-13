const https = require('https');
const fs = require('fs');
const videoIds = [
  "tFpwBr_7KPg", "fjiOCmFljDM", "5hZCR8lTdBk", "RyztKrzaMNk", "uFbNtqP966A", "D-kqUKEQZZ0", "YrcnBlH8XDA", "iaRefVKBH8M", "YT0K0PBl3nk", "Jq4YWyLSh_o", "552L1K3Rb_Q", "sOYvvFPYdsU", "SCQVmN1gYsk", "Ru2yE4wWUvE", "xBJBTfPcvhM", "zURHw38OZTM", "eWAjlO4FWPQ", "w11Kqjm-ycE", "SwloMZs8ZVk", "r8K1Fkch5go", "8RwbLtfLu6A", "V8uasBf-Es8", "gfIx0U5bTMA", "1LhGmhVFe2Y", "CuIkTLjx6fo", "zDecGJLyVm8", "zGXvPjlgVkk", "Mp2kp2tVhGQ", "av_h904QAEY", "b0ypSz63UGo", "fzpYiRtzmFA", "DjO2G9DIerQ", "xY3sQXYhk7A", "9BfxdGmekv4", "TZAmthQJkh8", "q8qlHwcuOtc", "Xx6iqyRM5Mk", "GhrVM-jPIEA", "8W67lZ5mwTU", "CenC1xVpMvI", "ijsSiWSzYw0", "dEdnC3ca-Yg", "jTmI3Q1iQUk", "YmlMsvNGTKA", "AOsdioes78c", "fbLTzgTKOR8", "mpcPTUAhfto", "mP99WSRI6Bc", "64RFJSCJuN8", "JmsY9nSqX9E", "DKaKmnB0BO8", "GYoUoVNlbGc", "bCa036rGtVU", "K2yKEoazT3g", "2ITgeRy2z2s", "NPa8YvUg4CM", "9_I1PqZAjdA", "o4eazahiXQw", "epBrpaGHMcg", "QRLGyl5-i4k", "TRwhJ0TCoqI", "6pfj0G7VKdM", "sX4tGtcc62k", "6GYTbv-LtV0", "whJzh_27yHs", "3FNfi_PrP9Y", "0eQQwveeQzw", "yv0aAY7M1mk", "FMSCZYu1JhE", "TWUnnDK8rck", "S6DTPNZ_-F4", "u00CqDeAHTE", "jw9tvoGLJmo", "YdUUYFgpA7g", "fYZmIC9_sx4", "KSJc8bhSjB0", "oDKGCsTjAk8", "fXI8gN6pq1k", "3CaIq8jZe18", "rGqwkinWqYI", "CWH5J_7kzjM", "5KX0EjOTMaI", "vHBedP8oeCA", "oRxTKRtP8RE", "irOzFVqJ0IE", "1ydRu2K6oHg", "c-Yj6God14s", "5h_NehuTqe4", "moFqLlptX7Q", "WtokJfvWl-I", "jshWFhUTE-o", "CrfvmSGfT2c", "49VVIiqqOOs", "Y8fb_rtEU_4", "ua0XuKwKQ9M", "a7AH8W7dQIw", "PrwC-5NTCCs", "Zjzt4MRbAlc", "jBIvbpyb99M", "nN5RV1arpfM", "Hy6f1Lz_PiA", "B8PB5RPhTWQ", "2Vg5j_UZr-U", "CI88L1VNvEs", "Q8ebdJL_-lo", "OfjncdW_Vyc", "AABuMGK9H28", "FvekMyIs-yk", "RyGOGviYWts", "R7f45Mv7yyg", "gGTgyCU9gcg", "V-B_Y-OvOTQ", "S2agsLlUSII", "JvAc3k4Jdqw", "Hr7Lp9cRvr4", "1yKAQLVV_XI", "SEjKxJGg_C8", "6lR2JdxUh7w", "0ZjD1gM8ldQ", "L3lMBRwsFlw", "KokUK4RgsHc", "20tbMlP71Nc", "Z0NIYS9nyoQ", "Yvz4fHuLfsw", "0F28Ha_9Y8Y", "zv5bwzjN1Q4", "9ksG-O0ZUto", "IBRrEPQZUO0", "6LGHiZ5iZbE", "WTkQLAethtg", "eE3v36jNqDE", "gzavDZmYDHk", "SUAafTp7WTQ", "IYXRrYXfVLc", "Oq7gJuAuJh0", "QkAMC88WfXw", "74uXdbCYZQY", "qsmjaYao9pA", "RMGuHVQKOms", "qpzwJd7mr3Y", "KDeYqB9GYeg", "_74oMsrIFXA", "iswhjR-_-Xg", "z7Fx-RY4kXw", "SNcQJjXWa_E", "3AZSudcQ1N0", "Z1uu0uHYl20", "FKY1GmU-nYI", "lWIEZ6NxPMk", "JkY3nBTbRac", "EAW6XDAlZPo", "ijgSR2yriyg", "KYfVrzmh-GU", "HpW1nqPsGvw", "_ceLw3Q6uTA", "IZNaQzWXgwA", "opVMIWzaNFY", "Kf2kXBoIgM0", "xtZvYrfw2Is", "IAktPXPhWYQ", "1D4r_xpln88", "NwQ5Ch5t5Vk", "BFZyW_7ld0c", "8iXorduqXC8", "rRpQJAJZgiI", "MlqHZEhBGtw", "Rm7CPzKLK1M", "dyFeDqVApFU", "nW5pGot-Hok", "BC_eDtrB-M4", "QSGe2Sd8kUI", "D0KZo_gBsw0", "pozooPg6PBE", "AE49-Oqh-0w", "OXs4DCS8Ei8", "iBbvHfbKiYc", "eJF2gdt9PcE"
];

async function fetchTitle(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ id, title: json.title });
        } catch (e) {
          resolve({ id, title: 'Unknown' });
        }
      });
    }).on('error', () => resolve({ id, title: 'Error' }));
  });
}

async function main() {
  const results = [];
  for (let i = 0; i < videoIds.length; i += 10) {
    const batch = videoIds.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(fetchTitle));
    results.push(...batchResults);
  }
  fs.writeFileSync('video_titles.json', JSON.stringify(results, null, 2));
  console.log('Done');
}

main();
