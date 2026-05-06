import sharp from 'sharp';

async function generateIcons() {
  const input = 'public/logo.webp';
  
  await sharp(input)
    .resize(192, 192, { fit: 'contain', background: '#000000' })
    .flatten({ background: '#000000' })
    .png()
    .toFile('public/icon-192.png');
    
  await sharp(input)
    .resize(512, 512, { fit: 'contain', background: '#000000' })
    .flatten({ background: '#000000' })
    .png()
    .toFile('public/icon-512.png');
    
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
