/* import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import  generateXML  from './generateXML.js';
import  extractTransferData from './extractTransferData.js';
import pdfPoppler from 'pdf-poppler';

let carpetasComprobantes = {
  MP : './comprobantes/Mp/',
  BNA : './comprobantes/BNA/',
  Santander : './comprobantes/Santander/',  
  CuentaDni : './comprobantes/CuentaDni/',
  BBVA : './comprobantes/BBVA/',
  BRUBANK : './comprobantes/BRUBANK/',
   GALICIA : './comprobantes/Galicia/',
   GALICIA2 : './comprobantes/Galicia2/',  
  Astropay : './comprobantes/AstroPay/',
  BancoCiudad : './comprobantes/BancoCiudad/',
  BancoDelSol : './comprobantes/BancoDelSol/',
  GaliciaMas : './comprobantes/GaliciaMas/', 
  NaranjaX : './comprobantes/NaranjaX/',
  ICBC : './comprobantes/ICBC/',  
  Hipotecario : './comprobantes/Hipotecario/', 
  PersonalPay : './comprobantes/PersonalPay/',
  Provincia: './comprobantes/Provincia/',
  Supervielle: './comprobantes/Supervielle/',
  Uala2 : './comprobantes/Uala2/', 
  Uala : './comprobantes/Uala/',
  Marco :  './comprobantes/Macro/',
  Lemon : './comprobantes/Lemon/' 
    
}

let allTransferData = [];

async function convertPdfToPng(pdfPath, outputDir) {
  const fileName = path.basename(pdfPath, path.extname(pdfPath));
  const outputFileName = `${fileName}-1.png`; // Primera página del PDF
  const outputPath = path.join(outputDir, outputFileName);

  let opts = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: fileName,
    page: 1,
  };

  try {
    await pdfPoppler.convert(pdfPath, opts);
    
    if (!fs.existsSync(outputPath)) {
      console.error(`❌ Error: No se encontró el archivo convertido ${outputPath}`);
      console.error(`📂 Verifique si pdf-poppler generó un archivo con otro nombre.`);
      
      const possibleFiles = fs.readdirSync(outputDir).filter(file => file.startsWith(fileName) && file.endsWith('.png'));
      
      if (possibleFiles.length > 0) {
        console.log(`🔍 Se encontró otro archivo generado: ${possibleFiles[0]}`);
        return path.join(outputDir, possibleFiles[0]);
      } else {
        console.error(`❌ No se encontró ningún archivo PNG en la carpeta de salida.`);
        return null;
      }
    }

    console.log(`✅ PDF convertido a PNG: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${pdfPath} a PNG:`, error);
    return null;
  }
}

async function processFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    let filePath = path.join(folderPath, file);

     if (ext === '.pdf') {
      console.log(`📄 Detectado PDF: ${filePath}, convirtiendo a PNG...`);
      const convertedPath = await convertPdfToPng(filePath, folderPath);
      if (!convertedPath) continue;
      filePath = convertedPath;
    }

    if (['.png', '.jpg', '.jpeg'].includes(path.extname(filePath).toLowerCase())) {
      console.log(`🔍 Procesando: ${filePath}`);
      try {
        const transferData = await extractTransferData(filePath, folderPath);
        const fileName = path.parse(filePath).name;
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

  await Promise.all(Object.values(carpetasComprobantes).map(folder => processFolder(folder)));

  const uniqueData = [];
  const seenIds = new Set();

  for (const transfer of allTransferData) {
    const id = transfer.codigoIdentificacion;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueData.push(transfer);
    }
  }

  if (uniqueData.length > 0) {
    const csv = parse(uniqueData, { fields: Object.keys(uniqueData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado sin duplicados: comprobantes_csv/todos_comprobantes.csv');
  }
}

processAllImages(); */

/*  export default processAllImages; */

import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import generateXML from './generateXML.js';
import extractTransferData from './extractTransferData.js';
import pdfPoppler from 'pdf-poppler';
import Tesseract from 'tesseract.js';

let carpetasComprobantes = {
  MP: './comprobantes/Mp/',
  BNA: './comprobantes/BNA/',
  Santander: './comprobantes/Santander/',
  CuentaDni: './comprobantes/CuentaDni/',
  BBVA: './comprobantes/BBVA/',
  BRUBANK: './comprobantes/BRUBANK/',
  GALICIA: './comprobantes/Galicia/',
  GALICIA2: './comprobantes/Galicia2/',
  Astropay: './comprobantes/AstroPay/',
  BancoCiudad: './comprobantes/BancoCiudad/',
  BancoDelSol: './comprobantes/BancoDelSol/',
  GaliciaMas: './comprobantes/GaliciaMas/',
  NaranjaX: './comprobantes/NaranjaX/',
  ICBC: './comprobantes/ICBC/',
  Hipotecario: './comprobantes/Hipotecario/',
  PersonalPay: './comprobantes/PersonalPay/',
  Provincia: './comprobantes/Provincia/',
  Supervielle: './comprobantes/Supervielle/',
  Uala2: './comprobantes/Uala2/',
  Uala: './comprobantes/Uala/',
  Macro: './comprobantes/Macro/',
  Lemon: './comprobantes/Lemon/',
  Otros: './comprobantes/Lemon/'
};

async function classifyBankStatement(filePath) {
  let text = '';

  // Si es un archivo PDF, convertirlo a imagen y extraer texto de la imagen
  if (filePath.endsWith('.pdf')) {
    const imagePath = await convertPdfToPng(filePath, path.dirname(filePath));
    if (!imagePath) return null; // Si no se puede convertir el PDF, no lo procesamos
    text = await extractTextFromImage(imagePath);
  } else {
    // Si ya es una imagen, extraemos directamente el texto
    text = await extractTextFromImage(filePath);
  }

  // Definir las expresiones regulares para identificar los bancos
  const bankKeywords = {
    Uala2: /u\s*a\s*l\s*[aá]/i,
    Macro: /CA - PESOS -/i,
    BNA: /^<\s*E\s+Transferencia\s*$/im,
    Provincia: /Banco Provincia.*Operación realizada con éxito/i,
    NaranjaX: /Naranja X|Naranja Digital Compañia Financiera S.A.U/i,
    BRUBANK: /\bBrubank\b/i,
    Supervielle: /\bSUPERVIELLE\b/i,
    MP: /mercado\s*pago/i,
    BBVA:  /\bBBVA?\b/i,
    CuentaDni: /\bDNI\b/i,
    Santander: /\bSantander\b.*Comprobante de Transferencia/i,
    ICBC: /Sujeto a impuestos y comisiones determinadas por tu banco\.\s+La transferencia se cursó al destino de forma inmediata\./i,
    GaliciaMas: /Galicia Más.*Transferencia realizada con éxito/i,
    GALICIA: /\bGalicia\b/i,
    BancoDelSol:/BANCO\s*[\w\s]*DEL\s*SOL[\s\S]*?SANCOR\s+SEGUROS/i,
    BancoCiudad: /Canal\s+Referencia\s+Banca\s+M[oó]vil/i,
    PersonalPay: /\bPersonal Pay\b/i
  };

  // Intentar identificar el banco con las expresiones regulares
  for (const [bank, regex] of Object.entries(bankKeywords)) {
    if (regex.test(text)) {
      const targetFolder = carpetasComprobantes[bank];
      const newFilePath = path.join(targetFolder, path.basename(filePath));

      // Crear la carpeta si no existe
      if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

      // Mover el archivo a la carpeta correspondiente
      fs.renameSync(filePath, newFilePath);
      console.log(`📂 Comprobante clasificado en: ${targetFolder}`);

      return newFilePath; // Devuelvo el nuevo archivo movido
    }
  }

  // Si no se pudo clasificar, mostramos una advertencia
  console.warn(`⚠️ No se pudo clasificar el archivo: ${filePath}`);
  return null;
}

async function extractTextFromImage(imagePath) {
  try {
    const { data } = await Tesseract.recognize(imagePath, 'spa', { logger: m => console.log(m) });
    console.log("🔍 Texto extraído del comprobante:", data.text);
    return data.text;
  } catch (error) {
    console.error(`❌ Error en OCR para ${imagePath}:`, error);
    return '';
  }
}

let allTransferData = [];

async function convertPdfToPng(pdfPath, outputDir) {
  const fileName = path.basename(pdfPath, path.extname(pdfPath));
  const outputFileName = `${fileName}-1.png`; // Primera página del PDF
  const outputPath = path.join(outputDir, outputFileName);

  let opts = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: fileName,
    page: 1,
  };

  try {
    await pdfPoppler.convert(pdfPath, opts);
    
    if (!fs.existsSync(outputPath)) {
      console.error(`❌ Error: No se encontró el archivo convertido ${outputPath}`);
      console.error(`📂 Verifique si pdf-poppler generó un archivo con otro nombre.`);
      
      const possibleFiles = fs.readdirSync(outputDir).filter(file => file.startsWith(fileName) && file.endsWith('.png'));
      
      if (possibleFiles.length > 0) {
        console.log(`🔍 Se encontró otro archivo generado: ${possibleFiles[0]}`);
        return path.join(outputDir, possibleFiles[0]);
      } else {
        console.error(`❌ No se encontró ningún archivo PNG en la carpeta de salida.`);
        return null;
      }
    }

    console.log(`✅ PDF convertido a PNG: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${pdfPath} a PNG:`, error);
    return null;
  }
}

export async function processFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    let filePath = path.join(folderPath, file);

     if (ext === '.pdf') {
      console.log(`📄 Detectado PDF: ${filePath}, convirtiendo a PNG...`);
      const convertedPath = await convertPdfToPng(filePath, folderPath);
      if (!convertedPath) continue;
      filePath = convertedPath;
    }

    if (['.png', '.jpg', '.jpeg'].includes(path.extname(filePath).toLowerCase())) {
      console.log(`🔍 Procesando: ${filePath}`);
      try {
        const transferData = await extractTransferData(filePath, folderPath);
        const fileName = path.parse(filePath).name;
        generateXML(transferData, fileName);
        allTransferData.push(transferData);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
  }
}

async function processAllImages() {
  const folderTodos = './todos/';
  if (!fs.existsSync(folderTodos)) return;
  const files = fs.readdirSync(folderTodos);

  // Procesar cada archivo en la carpeta 'todos'
  for (const file of files) {
    const filePath = path.join(folderTodos, file);
    const newFilePath = await classifyBankStatement(filePath);
  }

  // Procesar los archivos dentro de las carpetas de cada banco
  await Promise.all(Object.values(carpetasComprobantes).map(folder => processFolder(folder)));

  const uniqueData = [];
  const seenIds = new Set();

  for (const transfer of allTransferData) {
    const id = transfer.codigoIdentificacion;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueData.push(transfer);
    }
  }

  if (uniqueData.length > 0) {
    const csv = parse(uniqueData, { fields: Object.keys(uniqueData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado sin duplicados: comprobantes_csv/todos_comprobantes.csv');
  }
}

// Procesar todas las imágenes de la carpeta 'todos'
 processAllImages();

/* export default processAllImages;  */