import fs from 'fs';
import xml2js from 'xml2js';



export function generateXML(data, fileName) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ transferencia: data });
  fs.writeFileSync(`comprobantes_xml/${fileName}.xml`, xml, 'utf-8');
  console.log(`📂 XML guardado: comprobantes_xml/${fileName}.xml`);
}

export default generateXML;