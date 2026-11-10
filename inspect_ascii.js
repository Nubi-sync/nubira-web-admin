const { Jimp } = require('jimp');

async function inspectPhoneCrop() {
  const crop = await Jimp.read('C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\phone_exact.png');
  console.log('Phone crop size:', crop.width, 'x', crop.height);

  // Print ascii brightness grid (28x36)
  for (let y = 0; y < crop.height; y += 12) {
    let row = '';
    for (let x = 0; x < crop.width; x += 10) {
      const color = crop.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      const bright = (r + g + b) / 3;
      if (bright > 220) row += '#';
      else if (bright > 160) row += '+';
      else if (bright > 100) row += '.';
      else row += ' ';
    }
    console.log(String(y).padStart(3, ' '), row);
  }
}

inspectPhoneCrop().catch(console.error);
