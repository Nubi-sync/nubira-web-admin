const { Jimp } = require('jimp');

async function mapImage() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);
  console.log('Original:', img.width, 'x', img.height);

  // Resize to 48 x 86 to see the full layout
  const thumb = img.clone().resize({ w: 48, h: 86 });
  for (let y = 0; y < thumb.height; y += 2) {
    let row = '';
    for (let x = 0; x < thumb.width; x++) {
      const color = thumb.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      const bright = (r + g + b) / 3;
      if (bright > 220) row += 'W';
      else if (bright > 170) row += '#';
      else if (bright > 120) row += '+';
      else if (bright > 70) row += '.';
      else row += ' ';
    }
    console.log(String(y * 16).padStart(4, ' '), row);
  }
}

mapImage().catch(console.error);
