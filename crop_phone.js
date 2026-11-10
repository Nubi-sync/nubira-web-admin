const { Jimp } = require('jimp');

async function cropPhone() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);
  const crop = img.clone().crop({ x: 100, y: 350, w: 280, h: 360 });
  await crop.write('C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\phone_exact.png');
  console.log('Saved phone_exact.png');
}

cropPhone().catch(console.error);
