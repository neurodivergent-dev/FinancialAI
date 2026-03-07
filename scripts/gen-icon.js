const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(process.cwd(), 'assets/notification-icon.png');

// Önceki (daha sade ve şık olan) gerçek cüzdan tasarımı
const realWalletSvg = `
<svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 7V5C20 3.89543 19.1046 3 18 3H4C2.89543 3 2 3.89543 2 5V19C2 20.1046 2.89543 21 4 21H18C19.1046 21 20 20.1046 20 19V17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 12C16 13.1046 16.8954 14 18 14H22V10H18C16.8954 10 16 10.8954 16 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 10V14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

async function generateRealWalletIcon() {
  console.log('🕯️ Reverting to the previous elegant wallet design...');
  
  try {
    const svgBuffer = Buffer.from(realWalletSvg);
    
    await sharp(svgBuffer)
      .resize(96, 96)
      .png()
      .toFile(OUTPUT_PATH);

    console.log('✅ Success! Reverted to the previous icon at: ' + OUTPUT_PATH);
  } catch (e) {
    console.error('❌ Failed:', e);
  }
}

generateRealWalletIcon();
