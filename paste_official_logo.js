const { Jimp } = require('jimp');

async function pasteOfficialLogo() {
  const imgPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_indian_owner_well_dressed_1794338651642.jpg';
  const logoPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\.user_uploaded\\media_1794338469648_38df7e69.png';

  const baseImg = await Jimp.read(imgPath);
  const logoImg = await Jimp.read(logoPath);

  // Screen bounds:
  // minX: 242, maxX: 305, width: 63
  // minY: 500, maxY: 625, height: 125
  const screenMinX = 243;
  const screenMaxX = 304;
  const screenMinY = 502;
  const screenMaxY = 623;

  // 1. Clean the phone screen center to pure solid white (#FFFFFF)
  // Leave a slight bezel border (1-2px from the edges)
  for (let y = screenMinY + 4; y <= screenMaxY - 4; y++) {
    for (let x = screenMinX + 2; x <= screenMaxX - 2; x++) {
      baseImg.setPixelColor(0xFFFFFFFF, x, y);
    }
  }

  // 2. Add subtle dynamic island / camera pill at top of phone screen
  const pillW = 12;
  const pillH = 3;
  const pillX = Math.round((screenMinX + screenMaxX) / 2 - pillW / 2);
  const pillY = screenMinY + 3;
  for (let y = pillY; y < pillY + pillH; y++) {
    for (let x = pillX; x < pillX + pillW; x++) {
      baseImg.setPixelColor(0x111111FF, x, y);
    }
  }

  // 3. Resize the official logo to fit the phone screen nicely
  // Logo width 48px, height 48px (maintaining 1:1 aspect ratio)
  const targetLogoWidth = 48;
  const targetLogoHeight = 48;
  logoImg.resize({ w: targetLogoWidth, h: targetLogoHeight });

  // Center logo horizontally and vertically in the phone screen
  const logoX = Math.round((screenMinX + screenMaxX) / 2 - targetLogoWidth / 2);
  const logoY = Math.round((screenMinY + screenMaxY) / 2 - targetLogoHeight / 2) + 2;

  // Composite the logo onto the base image
  baseImg.composite(logoImg, logoX, logoY, {
    mode: 'srcOver',
    opacitySource: 1.0,
    opacityDest: 1.0
  });

  // Save to brain directory
  const outBrainPath = 'C:\\Users\\shaws\\.gemini\\antigravity\\brain\\5210eac2-6858-4ccc-b2cf-4cdd037e1c59\\zigza_final_composited_launch.jpg';
  await baseImg.write(outBrainPath);
  console.log('Saved composited image to:', outBrainPath);

  // Also save directly to mobile app assets!
  const assetPath1 = 'c:\\Users\\shaws\\NubiSync\\nubira-mobile-app\\assets\\images\\zigza_launch_bg_welldressed.jpg';
  const assetPath2 = 'c:\\Users\\shaws\\NubiSync\\nubira-mobile-app\\assets\\images\\zigza_launch_bg_official_logo.jpg';
  const assetPath3 = 'c:\\Users\\shaws\\NubiSync\\nubira-mobile-app\\assets\\images\\zigza_launch_bg_indian_owner.jpg';
  await baseImg.write(assetPath1);
  await baseImg.write(assetPath2);
  await baseImg.write(assetPath3);
  console.log('Saved to app assets successfully!');
}

pasteOfficialLogo().catch(console.error);
