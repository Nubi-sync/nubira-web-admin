const { Jimp } = require('jimp');

async function analyzePhone() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);

  // Let's find the phone screen center by finding the bounding box of the white phone screen
  // Sample a grid from x: 100 to 400, y: 450 to 750
  let points = [];
  for (let y = 400; y < 850; y += 4) {
    for (let x = 80; x < 450; x += 4) {
      const color = img.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      // Screen background is very white (> 220 in all channels)
      if (r > 220 && g > 220 && b > 220) {
        points.push({ x, y });
      }
    }
  }

  // Calculate centroid
  const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
  const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;

  console.log('Centroid of screen:', { avgX: Math.round(avgX), avgY: Math.round(avgY), totalWhitePoints: points.length });

  // Print bounds
  const xs = points.map(p => p.x).sort((a,b) => a-b);
  const ys = points.map(p => p.y).sort((a,b) => a-b);
  console.log('X range:', xs[0], 'to', xs[xs.length - 1]);
  console.log('Y range:', ys[0], 'to', ys[ys.length - 1]);

  // Let's find angle by linear regression of top edge or left edge of screen
  // Topmost points for each X
  let topByX = {};
  points.forEach(p => {
    if (!topByX[p.x] || p.y < topByX[p.x]) topByX[p.x] = p.y;
  });
  
  // Leftmost points for each Y
  let leftByY = {};
  points.forEach(p => {
    if (!leftByY[p.y] || p.x < leftByY[p.y]) leftByY[p.y] = p.x;
  });

  const topXs = Object.keys(topByX).map(Number).sort((a,b)=>a-b);
  console.log('Sample top edge:', topXs.slice(0, 10).map(x => ({ x, y: topByX[x] })));

  const leftYs = Object.keys(leftByY).map(Number).sort((a,b)=>a-b);
  console.log('Sample left edge:', leftYs.slice(0, 10).map(y => ({ y, x: leftByY[y] })));
}

analyzePhone().catch(console.error);
