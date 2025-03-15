const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);

  console.log("🔍 Texto extraído del PDF:");
  console.log(pdfData.text); // 📌 Muestra el texto exacto extraído

  return pdfData.text;
}

// Prueba con tu archivo
extractTextFromPdf('./comprobantes/tu_archivo.pdf');
