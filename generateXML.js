import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

export function generateXML(data, fileName) {
  try {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ transferencia: data });

  const folderPath = './temp/comprobantes_xml/';
  const fullPath = path.join(folderPath, `${fileName}.xml`);

  // Verificar que la carpeta exista
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Escribir el archivo
  fs.writeFileSync(fullPath, xml, 'utf-8');
  console.log(`📂 XML guardado: ${fullPath}`);
  } catch (error) {
    console.error(`❌ Error generando XML para ${fileName}:`, error);
  }
} 

export default generateXML;
