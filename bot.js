const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const IMGBB_API_KEY = '08f302f88262628bfe92d16dc15a2f91';

const webs = [
  { url: 'https://planett.site/user/Pr%C3%ADncipe%20Azul/activity', nombre: 'planett' },
  { url: 'http://latinask.com/index.php?qa=user&qa_1=Pr%C3%ADncipe+Azul/activity', nombre: 'latinask' }
];

// Función para obtener fecha y hora en formato YYYY-MM-DD_HH-mm (hora Venezuela)
function getFormattedDate() {
  const date = new Date();
  // Ajustar a UTC-4 (hora Venezuela)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const venezuelaOffset = -4 * 60; // -4 horas en minutos
  const venezuelaDate = new Date(utc + venezuelaOffset * 60000);

  const year = venezuelaDate.getFullYear();
  const month = String(venezuelaDate.getMonth() + 1).padStart(2, '0');
  const day = String(venezuelaDate.getDate()).padStart(2, '0');
  const hour = String(venezuelaDate.getHours()).padStart(2, '0');
  const minute = String(venezuelaDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}_${hour}-${minute}`;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (let web of webs) {
    try {
      const page = await browser.newPage();
      await page.goto(web.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      const timestamp = getFormattedDate();
      const filePath = `${web.nombre}_${timestamp}.png`;

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
