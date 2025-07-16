import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import generateXML from './generateXML.js';
import extractTransferData from './extractTransferData.js';
import { fromPath } from 'pdf2pic';
import { createWorker } from 'tesseract.js';

let carpetasComprobantes = {
  MP: './temp/comprobantes/Mp/',
  BNA: './temp/comprobantes/BNA/',
  Santander: './temp/comprobantes/Santander/',
  CuentaDni: './temp/comprobantes/CuentaDni/',
  BBVA: './temp/comprobantes/BBVA/',
  BRUBANK: './temp/comprobantes/BRUBANK/',
  GALICIA: './temp/comprobantes/Galicia/',
  GALICIA2: './temp/comprobantes/Galicia2/',
  Astropay: './temp/comprobantes/AstroPay/',
  BancoCiudad: './temp/comprobantes/BancoCiudad/',
  BancoDelSol: './temp/comprobantes/BancoDelSol/',
  GaliciaMas: './temp/comprobantes/GaliciaMas/',
  NaranjaX: './temp/comprobantes/NaranjaX/',
  ICBC: './temp/comprobantes/ICBC/',
  Hipotecario: './temp/comprobantes/Hipotecario/',
  PersonalPay: './temp/comprobantes/PersonalPay/',
  Provincia: './temp/comprobantes/Provincia/',
  Supervielle: './temp/comprobantes/Supervielle/',
  Uala2: './temp/comprobantes/Uala2/',
  Uala: './temp/comprobantes/Uala/',
  Macro: './temp/comprobantes/Macro/',
  Lemon: './temp/comprobantes/Lemon/',
  Prex: './temp/comprobantes/Prex/',
  Patagonia: './temp/comprobantes/Patagonia/',
  NBCH: './temp/comprobantes/NBCH/'
};

const requiredFolders = [
  './temp/comprobantes/',
  './temp/comprobantes_csv/',
  './temp/todos/',
  ...Object.values(carpetasComprobantes)
];

for (const folder of requiredFolders) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
}

async function classifyBankStatement(filePath, worker) {
  let text = '';

  if (filePath.endsWith('.pdf')) {
    const imagePath = await convertPdfToPng(filePath, path.dirname(filePath));
    if (!imagePath) return null;
    text = await extractTextFromImage(imagePath, worker);
  } else {
    text = await extractTextFromImage(filePath, worker);
  }

  const bankKeywords = {
    Santander: /Santander|módulo\s+de\s+Pagos\s+y\s+Transferencias\s+en\s+Online\s+Banking\s+Personas/i,
    Uala2: /u\s*a\s*l\s*[aá]|(?<!\w)lá\s/i,
    Macro: /CA - PESOS -/i,
    BNA: /(^<\s*E\s+Transferencia\s*$)|(^Fecha\s+\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\s+[A-Z\s]{3,}$)/gim,
    Provincia: /Banco Provincia/i,
    NaranjaX: /Naranja X|Naranja Digital Compañia Financiera S.A.U/i,
    BRUBANK: /\bBrubank\b/i,
    Supervielle: /\bSUPERVIELLE\b/i,
    MP: /mercado\s*pago/i,
    BBVA: /\bBBVA?\b/i,
    Patagonia: /Patagonia/i,
    NBCH: /NBCH/i,
    CuentaDni: /\bDNI\b/i,
    ICBC: /Sujeto a impuestos y comisiones determinadas por tu banco\.\s+La transferencia se cursó al destino de forma inmediata\./i,
    GaliciaMas: /Galicia Más/i,
    GALICIA: /\bGalicia\b/i,
    BancoDelSol: /BANCO\s*[\w\s]*DEL\s*SOL[\s\S]*?SANCOR\s+SEGUROS/i,
    BancoCiudad: /Canal\s+Referencia\s+Banca\s+M[oó]vil/i,
    PersonalPay: /\bPersonal Pay\b/i,
    Prex: /Prex/i,
  };

  for (const [bank, regex] of Object.entries(bankKeywords)) {
    if (regex.test(text)) {
      const targetFolder = carpetasComprobantes[bank];
      const newFilePath = path.join(targetFolder, path.basename(filePath));

      if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

      fs.renameSync(filePath, newFilePath);
      console.log(`📂 Comprobante clasificado en: ${targetFolder}`);

      return newFilePath;
    }
  }

  console.warn(`⚠️ No se pudo clasificar el archivo: ${filePath}`);
  return null;
}

async function extractTextFromImage(imagePath, worker) {
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    console.log("🔍 Texto extraído del comprobante:", text);
    return text;
  } catch (error) {
    console.error(`❌ Error en OCR para ${imagePath}:`, error);
    return '';
  }
}

async function convertPdfToPng(pdfPath, outputDir) {
  const fileName = path.basename(pdfPath, path.extname(pdfPath));
  const outputFileName = `${fileName}-1.png`;
  const outputPath = path.join(outputDir, outputFileName);

  const converter = fromPath(pdfPath, {
    density: 100,
    saveFilename: fileName,
    savePath: outputDir,
    format: "png",
    width: 800,
    height: 1100
  });

  try {
    const result = await converter(1);
    if (result.success && fs.existsSync(outputPath)) {
      console.log(`✅ PDF convertido a PNG: ${outputPath}`);
      return outputPath;
    } else {
      console.error(`❌ Error: No se generó la imagen para ${pdfPath}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error al convertir ${pdfPath} con pdf2pic:`, error);
    return null;
  }
}

export async function processFolder(folderPath, allTransferData, worker) {
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
        if (transferData) {
          const fileName = path.parse(filePath).name;
          generateXML(transferData, fileName);
          allTransferData.push(transferData);
        } else {
          console.warn(`⚠️ No se pudo extraer datos de: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
  }
}

async function processAllImages() {
  let allTransferData = [];

  const worker = await createWorker('spa');

  const folderTodos = './temp/todos/';
  if (!fs.existsSync(folderTodos)) return;
  const files = fs.readdirSync(folderTodos);

  for (const file of files) {
    const filePath = path.join(folderTodos, file);
    await classifyBankStatement(filePath, worker);
  }

  for (const folder of Object.values(carpetasComprobantes)) {
    await processFolder(folder, allTransferData, worker); // uno por uno, espera a que termine
  }

  await worker.terminate();

  const uniqueData = [];
  const seenIds = new Set();

/*   for (const transfer of allTransferData) {
    if (!transfer || !transfer.codigoIdentificacion) continue;

    const id = transfer.codigoIdentificacion;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueData.push(transfer);
    }
  } */

    for (const transfer of allTransferData) {
    const id = transfer.codigoIdentificacion;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueData.push(transfer);
    }
  }

  if (uniqueData.length > 0) {
    const csv = parse(uniqueData, { fields: Object.keys(uniqueData[0]) });
    let comprobanteName = `todos_comprobantes_${(new Date()).toISOString().split('T')[0].split('-').reverse().join('-')}.csv`;
    fs.writeFileSync(`./temp/comprobantes_csv/${comprobanteName}`, csv, 'utf-8');
    console.log('📂 CSV guardado sin duplicados: comprobantes_csv/todos_comprobantes.csv');
  }
}

export default processAllImages;
