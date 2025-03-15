/* const fs = require('fs');
const path = require('path');
const { extractPdfData } = require('./extractPdfData.js');
const { askForEmisorData } = require('./askForEmisorData.js');

// Ruta de la carpeta que contiene los PDFs
const folderPath = './comprobantes'; // Cambia a la carpeta donde están tus PDFs

// Arreglo para almacenar todos los datos
let allData = [];

// Leer los archivos PDF de la carpeta
fs.readdir(folderPath, async (err, files) => {
  if (err) {
    console.error('Error al leer la carpeta:', err);
    return;
  }

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    if (path.extname(file) === '.pdf') {
      console.log(`Procesando archivo: ${file}`);

      // Extraer datos del PDF
      let data = await extractPdfData(filePath);

      // Preguntar por datos faltantes (si es necesario)
      data = await askForEmisorData(data);

      // Agregar los datos al arreglo
      allData.push(data);
    }
  }

    // Una vez que hemos procesado todos los archivos, guardamos los datos en un archivo JSON
    fs.writeFileSync('comprobantes.json', JSON.stringify(allData, null, 2), 'utf-8');
    console.log('Datos guardados en comprobantes.json');
  });
 */

/*   const Tesseract = require('tesseract.js');
  const fs = require('fs');


  async function extractTextWithOCR(imagePath) {
    const { data } = await Tesseract.recognize(imagePath, 'spa'); // OCR en español
    const text = data.text;
  
    console.log("🔍 Texto extraído con OCR:");
    console.log(text); // 📌 Verifica el formato del texto extraído
  
    // 📌 Expresiones regulares para extraer los datos
    const fechaMatch = text.match(/Fecha de ejecución\s*([\d\/]+)/);
    const nombreEmisorMatch = text.match(/Titular cuenta destino\s*([\w\s]+)/);
    const cuilMatch = text.match(/CUIT\/CUIL\s*([\d-]+)/);
    const montoMatch = text.match(/Importe debitado\s*\$\s*([\d.,]+)/);
    const codigoIdentificacionMatch = text.match(/N[º°]?\s*comprobante\s*[:\-]?\s*([\d]+)/i);
  
    // 📌 Formatear los datos en un objeto
    const transferData = {
      fecha: fechaMatch ? fechaMatch[1] : null,
      nombreEmisor: nombreEmisorMatch ? nombreEmisorMatch[1].trim() : null,
      cuil: cuilMatch ? cuilMatch[1] : null,
      monto: montoMatch ? montoMatch[1].replace(',', '.') : null, // Reemplaza ',' por '.' para valores numéricos
      codigoIdentificacion: codigoIdentificacionMatch ? codigoIdentificacionMatch[1] : null
    };
  
    console.log("✅ Datos extraídos:", transferData);
    fs.writeFileSync('comprobantes.json', JSON.stringify(transferData, null, 2), 'utf-8');
    console.log('✅ Datos guardados en transferencias.json');
    return transferData;
  } */
  
/*     const fs = require('fs');
    const Tesseract = require('tesseract.js');
    const xml2js = require('xml2js');
    const { parse } = require('json2csv'); // 📌 Convierte JSON a CSV
    
    async function extractTransferData(imagePath) {
      const { data } = await Tesseract.recognize(imagePath, 'spa');
      const text = data.text;
    
      // Expresiones regulares mejoradas
      const fechaMatch = text.match(/Fecha de ejecución\s*([\d\/]+)/);
      const nombreEmisorMatch = text.match(/Titular cuenta destino\s*([\w\s]+)/);
      const montoMatch = text.match(/Importe debitado\s*\$\s*([\d.,]+)/);
      const cuilMatch = text.match(/(CUIT|CUIL|DNI)[^\d]*(\d{2}-?\d{7,8}-?\d)/);
      const codigoIdentificacionMatch = text.match(/N[º°]?\s*comprobante\s*[:\-]?\s*([\d]+)/i);
    
      const transferData = {
        fecha: fechaMatch ? fechaMatch[1] : null,
        nombreEmisor: nombreEmisorMatch ? nombreEmisorMatch[1].trim() : null,
        monto: montoMatch ? montoMatch[1].replace(',', '.') : null,
        cuil: cuilMatch ? cuilMatch[2] : null,
        codigoIdentificacion: codigoIdentificacionMatch ? codigoIdentificacionMatch[1] : null
      };
    
      return transferData;
    }
    
    // ✅ Función para generar XML
    function generateXML(data) {
      const builder = new xml2js.Builder();
      const xml = builder.buildObject({ transferencia: data });
      fs.writeFileSync('comprobante.xml', xml, 'utf-8');
      console.log('📂 Datos guardados en comprobante.xml');
    }
    
    // ✅ Función para generar CSV
    function generateCSV(data) {
      const csv = parse([data], { fields: Object.keys(data) });
      fs.writeFileSync('comprobante.csv', csv, 'utf-8');
      console.log('📂 Datos guardados en comprobante.csv');
    }
    
    // ✅ Función principal
    async function processImage(imagePath) {
      try {
        const transferData = await extractTransferData(imagePath);
        generateXML(transferData);
        generateCSV(transferData);
      } catch (error) {
        console.error("❌ Error al procesar la imagen:", error);
      }
    }
    
    // 📌 Ejecutar con la imagen
    processImage('./comprobantes/jpeg.jpeg'); */
    
    const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const xml2js = require('xml2js');
const { parse } = require('json2csv');

const carpetaComprobantes = './comprobantes/'; // 📂 Ruta de la carpeta


async function extractTransferData(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'spa');
  const text = data.text;

  const regexPatterns = {
    fecha: /(?:Fecha de ejecución|Fecha de operación|Fecha|Emitido el|Día de operación|Transacción realizada el)[^\d]*([\d\/-]{8,10})/i,
    nombreEmisor: /(?:Titular cuenta destino|Titular de la cuenta|Nombre del destinatario|Remitente|Origen de la transacción)[^\w]*([\w\s]+)/i,
    monto: /(?:Importe debitado|Monto total|Valor de la operación|Importe|Monto transferido|Total a pagar)[^\d]*\$\s*([\d.,]+)/i,
    cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{7,8}-?\d)/i,
    codigoIdentificacion: /(?:N[º°]?\s*comprobante|Referencia|Número de operación|ID de transacción|Código de operación|Comprobante N°)[^\d]*([\d]+)/i
  };

  function findMatch(text, pattern) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
    return null;
  }

  return {
    fecha: findMatch(text, regexPatterns.fecha),
    nombreEmisor: findMatch(text, regexPatterns.nombreEmisor),
    monto: findMatch(text, regexPatterns.monto)?.replace(',', '.'), // Normaliza decimales
    cuil: findMatch(text, regexPatterns.cuil),
    codigoIdentificacion: findMatch(text, regexPatterns.codigoIdentificacion)
  };

}

// ✅ Generar XML para cada archivo
function generateXML(data, fileName) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ transferencia: data });
  fs.writeFileSync(`comprobantes_xml/${fileName}.xml`, xml, 'utf-8');
  console.log(`📂 XML guardado: comprobantes_xml/${fileName}.xml`);
}

// ✅ Generar CSV para cada archivo
function generateCSV(data, fileName) {
  const csv = parse([data], { fields: Object.keys(data) });
  fs.writeFileSync(`comprobantes_csv/${fileName}.csv`, csv, 'utf-8');
  console.log(`📂 CSV guardado: comprobantes_csv/${fileName}.csv`);
}

// ✅ Procesar todos los archivos en la carpeta
async function processAllImages() {
  if (!fs.existsSync('comprobantes_xml')) fs.mkdirSync('comprobantes_xml');
  if (!fs.existsSync('comprobantes_csv')) fs.mkdirSync('comprobantes_csv');

  fs.readdir(carpetaComprobantes, async (err, files) => {
    if (err) {
      console.error("❌ Error al leer la carpeta:", err);
      return;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const filePath = path.join(carpetaComprobantes, file);
        console.log(`🔍 Procesando: ${filePath}`);

        try {
          const transferData = await extractTransferData(filePath);
          const fileName = path.parse(file).name; // Nombre sin extensión
          generateXML(transferData, fileName);
          generateCSV(transferData, fileName);
        } catch (error) {
          console.error(`❌ Error procesando ${file}:`, error);
        }
      }
    }
  });
}

// 📌 Ejecutar la función
processAllImages();



  
  

