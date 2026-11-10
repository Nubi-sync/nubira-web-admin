const { Jimp } = require('jimp');

async function findPhoneScreen() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);

  const crop = img.clone().crop({ x: 240, y: 470, w: 180, h: 220 });
  await crop.write('C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\phone_zoom.png');
  console.log('Saved phone_zoom.png');

  // Let's print the crop in console
  for (let y = 0; y < crop.height; y += 8) {
    let row = '';
    for (let x = 0; x < crop.width; x += 6) {
      const color = crop.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      const bright = (r + g + b) / 3;
      if (bright > 220) row += 'W';
      else if (bright > 180) row += '#';
      else if (bright > 120) row += '+';
      else if (bright > 70) row += '.';
      else row += ' ';
    }
    console.log(String(y + 470).padStart(4, ' '), row);
  }
}

findPhoneScreen().catch(console.error);
