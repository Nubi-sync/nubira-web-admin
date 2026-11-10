const { Jimp } = require('jimp');
const path = require('path');

async function inspect() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const img = await Jimp.read(imgPath);
  console.log('BASE IMAGE SIZE:', img.width, 'x', img.height);

  const logoPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\.user_uploaded\\media_1794338469648_38df7e69.png';
  const logo = await Jimp.read(logoPath);
  console.log('LOGO SIZE:', logo.width, 'x', logo.height);
}

inspect().catch(console.error);
