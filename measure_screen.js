const { Jimp } = require('jimp');

async function measureScreen() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);

  let lefts = [];
  let rights = [];
  let tops = [];
  let bottoms = [];

  for (let y = 500; y <= 625; y++) {
    for (let x = 240; x <= 330; x++) {
      const color = img.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      if (r > 200 && g > 200 && b > 200) {
        lefts.push(x);
        rights.push(x);
        tops.push(y);
        bottoms.push(y);
      }
    }
  }

  const minX = Math.min(...lefts);
  const maxX = Math.max(...rights);
  const minY = Math.min(...tops);
  const maxY = Math.max(...bottoms);

  console.log('EXACT SCREEN BOUNDS:', {
    minX, maxX, width: maxX - minX,
    minY, maxY, height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  });
}

measureScreen().catch(console.error);
