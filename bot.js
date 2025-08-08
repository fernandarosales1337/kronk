const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const IMGBB_API_KEY = '08f302f88262628bfe92d16dc15a2f91';

const webs = [
  { url: 'https://planett.site/user/Pr%C3%ADncipe%20Azul', nombre: 'planett' },
  { url: 'http://latinask.com/index.php?qa=user&qa_1=Pr%C3%ADncipe+Azul', nombre: 'latinask' }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (let web of webs) {
    try {
      const page = await browser.newPage();
      await page.goto(web.url, { waitUntil: 'networkidle2', timeout: 60000 });
      const filePath = `${web.nombre}.png`;
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`📸 Captura tomada de ${web.url}`);

      const form = new FormData();
      form.append('image', fs.createReadStream(filePath));

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        form,
        { headers: form.getHeaders() }
      );

      console.log(`✅ Subida a ImgBB: ${res.data.data.url}`);
    } catch (error) {
      console.error(`❌ Error en ${web.url}:`, error.message);
    }
  }

  await browser.close();
})();

