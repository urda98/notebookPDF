import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import  generateXML  from './generateXML.js';
import  extractTransferData from './extractTransferData.js';


const carpetaComprobantesMP = './Mp/';
const carpetaComprobantesBNA = './BNA/';
const carpetaComprobantesSantander = './Santander/';
const carpetaComprobantesCuentaDni = './CuentaDni/';
const carpetaComprobantesBBVA = './BBVA/';

let carpetasComprobantes = [carpetaComprobantesMP, carpetaComprobantesBNA , carpetaComprobantesSantander, carpetaComprobantesCuentaDni, carpetaComprobantesBBVA]


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

  await Promise.all(carpetasComprobantes.map(folder => processFolder(folder)));

  if (allTransferData.length > 0) {
    const csv = parse(allTransferData, { fields: Object.keys(allTransferData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado: comprobantes_csv/todos_comprobantes.csv');
  }
}

processAllImages();