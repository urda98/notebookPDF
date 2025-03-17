const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const xml2js = require('xml2js');
const { parse } = require('json2csv');
const sharp = require('sharp');

const carpetaComprobantesMP = './Mp/';
const carpetaComprobantesBNA = './BNA/';
const carpetaComprobantesSantander = './Santander/';
const carpetaComprobantesCuentaDni = './CuentaDni/';
const carpetaComprobantesBBVA = './BBVA/';


async function preprocessImage(imagePath) {
  const processedImagePath = `${imagePath}-processed.png`;
  await sharp(imagePath)
    .grayscale()
    .threshold(180)
    .toFile(processedImagePath);
  return processedImagePath;
}

async function extractTransferData(imagePath, folderPath) {
  const processedPath = await preprocessImage(imagePath);
  const { data } = await Tesseract.recognize(processedPath, 'spa', {
    tessedit_char_whitelist: '0123456789$,.',
    logger: (m) => console.log(m),
    oem: 3,
    psm: 3
  });
  const text = data.text;
  console.log(`📜 Texto extraído:\n${text}\n`);

  var regexPatterns;

  if(folderPath === './Mp/'){
     regexPatterns = {
      fecha: /(?:Fecha de ejecución|Fecha de la transferencia|Día de operación|Miércoles,|Martes,|Jueves,|Viernes,|Sábado,|Domingo,|Lunes,)\s*([\d]{1,2}\sde\s\w+\sde\s\d{4})/i,
      nombreEmisor: /\* De\s*([\w\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*CUIT)/i,
      monto: /(?:Importe debitado|Monto transferido|Total a pagar|Monto)[^\d]*\$?\s?([\d\.,]+)/i,
      cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{7,8}-?\d)/i,
      codigoIdentificacion: /(?:Código de identificación)[^\w]*(\w+)/i,
      banco: /(?:Banco|Entidad emisora|Institución financiera|Mercado Pago)/i
    };
  } if(folderPath === './BNA/'){
    regexPatterns = {
      fecha: /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
      nombreEmisor: /[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑ\s]+/,
      monto: /(?:Monto\s*\n?\s*\$?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i,
      cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{8}-?\d)/i,
      codigoIdentificacion: /(?:Número de transacción\s*\n?\s*)([A-Z0-9]+)/i,
      banco: /Banco\s+([A-Za-zÁÉÍÓÚÑ\s]+)/
    }
  } if(folderPath === './Santander/'){
    regexPatterns = {
      fecha: /Fecha de ejecución\s+(\d{2}\/\d{2}\/\d{4}|\d{2} de \w+ de \d{4})/i,
      nombreEmisor: null,
      monto: /Importe debitado\s*\$?\s*([\d.,]+)/i,
      cuil: null, // No se menciona en este comprobante
      codigoIdentificacion: /N\* comprobante\s+(\d+)/i,
      banco: /(santander|Banco\s+[A-Za-zÁÉÍÓÚÑ\s]+)/i
    } 
  } if(folderPath === './CuentaDni/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,  // Captura la fecha, en formato dd/mm/aaaa
      nombreEmisor: /Origen\s+([A-Za-zÁÉÍÓÚÑ\s]+)(?=\s*\d{2,3}(\.\d{3}){2})/i,   // Captura el nombre del emisor
      monto: /Importe\s*\$?\s*([\d.,]+)/i,  // Captura el monto con el signo de peso
      cuil: /CUIL:\s*([\d]{2}\.[\d]{3}\.[\d]{3})/i,  // Captura el CUIL con formato
      codigoIdentificacion: /Código de referencia\s+([A-Za-z0-9]+)/i,  // Captura el código de referencia
      banco: "CuentaDni" 
    }
  }if(folderPath === './BBVA/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,  // Captura la fecha, en formato dd/mm/aaaa
      nombreEmisor: /Origen\s+([A-Za-zÁÉÍÓÚÑ\s]+)(?=\s*\d{2,3}(\.\d{3}){2})/i,   // Captura el nombre del emisor
      monto: /Importe\s*\$?\s*([\d.,]+)/i,  // Captura el monto con el signo de peso
      cuil: /CUIL:\s*([\d]{2}\.[\d]{3}\.[\d]{3})/i,  // Captura el CUIL con formato
      codigoIdentificacion: /Código de referencia\s+([A-Za-z0-9]+)/i,  // Captura el código de referencia
      banco: "BBVA" 
    }
  }


  function findMatch(text, pattern) {
    const match = text.match(pattern);
    console.log(`🔍 Buscando con regex: ${pattern}`);
    console.log(`📌 Resultado encontrado:`, match);
    return match && match[1] ? match[1].trim() : null;
  }

  return {
    fecha: findMatch(text, regexPatterns.fecha),
    nombreEmisor: findMatch(text, regexPatterns.nombreEmisor),
    monto: findMatch(text, regexPatterns.monto),
    cuil: findMatch(text, regexPatterns.cuil),
    codigoIdentificacion: findMatch(text, regexPatterns.codigoIdentificacion),
    banco: regexPatterns.banco
  };
}


function generateXML(data, fileName) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ transferencia: data });
  fs.writeFileSync(`comprobantes_xml/${fileName}.xml`, xml, 'utf-8');
  console.log(`📂 XML guardado: comprobantes_xml/${fileName}.xml`);
}

let allTransferData = [];

async function processFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const filePath = path.join(folderPath, file);
      console.log(`🔍 Procesando: ${filePath}`);

      try {
        const transferData = await extractTransferData(filePath, folderPath);
        const fileName = path.parse(file).name;
        generateXML(transferData, fileName);
        allTransferData.push(transferData);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
  }
}

async function processAllImages() {
  if (!fs.existsSync('comprobantes_xml')) fs.mkdirSync('comprobantes_xml');
  if (!fs.existsSync('comprobantes_csv')) fs.mkdirSync('comprobantes_csv');

  await processFolder(carpetaComprobantesMP);
  await processFolder(carpetaComprobantesBNA);
  await processFolder(carpetaComprobantesSantander);
  await processFolder(carpetaComprobantesCuentaDni);
  await processFolder(carpetaComprobantesBBVA);
  

  if (allTransferData.length > 0) {
    const csv = parse(allTransferData, { fields: Object.keys(allTransferData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado: comprobantes_csv/todos_comprobantes.csv');
  }
}

processAllImages();