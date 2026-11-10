const { Jimp } = require('jimp');

async function findScreen() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);

  // Scan for bright pixels near center / left
  let minX = 768, maxX = 0, minY = 1376, maxY = 0;
  let brightCount = 0;

  for (let y = 350; y < 950; y++) {
    for (let x = 50; x < 500; x++) {
      const color = img.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      // White/light phone screen
      if (r > 210 && g > 210 && b > 210) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        brightCount++;
      }
    }
  }

  console.log('Bright region (Phone Screen estimate):', { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY, brightCount });

  // Let's also crop a patch around minX, minY, width, height and save it to inspect
  if (maxX > minX && maxY > minY) {
    const clone = img.clone();
    clone.crop({ x: Math.max(0, minX - 30), y: Math.max(0, minY - 30), w: Math.min(img.width - minX + 30, maxX - minX + 60), h: Math.min(img.height - minY + 30, maxY - minY + 60) });
    await clone.write('C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\phone_crop.jpg');
    console.log('Saved phone crop to brain/phone_crop.jpg');
  }
}

findScreen().catch(console.error);
