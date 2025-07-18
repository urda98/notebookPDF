import sharp from 'sharp';
import bankRegexMap from './regexConfig.js';
import fs from 'fs';
import crypto from 'crypto';


async function preprocessImage(imagePath) {
  const processedImagePath = `${imagePath}-processed.png`;

  if (!fs.existsSync(processedImagePath)) {
    await sharp(imagePath)
      .grayscale()
      .threshold(180)
      .toFile(processedImagePath);
    //console.log(`🖼 Imagen preprocesada y guardada en: ${processedImagePath}`);
  } else {
    console.log(`🖼 Imagen ya preprocesada existe: ${processedImagePath}`);
  }

  return processedImagePath;
}

export async function extractTransferData(imagePath, folderPath, worker) {
  const processedPath = await preprocessImage(imagePath);
    if (!fs.existsSync(processedPath)) {
      console.error(`❌ No se pudo generar imagen preprocesada para: ${imagePath}`);
      return null;
    }
/*   const { data } = await worker.recognize(processedPath, 'spa', {
    tessedit_char_whitelist: '0123456789$,.',
    logger: (m) => console.log(m),
    oem: 3,
    psm: 3
  }); */
    await worker.setParameters({
    tessedit_char_whitelist: '0123456789$,.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúÁÉÍÓÚ- ',
    preserve_interword_spaces: '1',
  });
  
  const { data } = await worker.recognize(processedPath);
  const text = data.text;
  //console.log(`📜 Texto extraído:\n${text}\n`);

 const regexPatterns = bankRegexMap[folderPath];

if (!regexPatterns) {
    console.warn(`⚠️ No hay patrones definidos para la carpeta: ${folderPath}`);
    return null;
}


  function findMatch(text, pattern) {
    if (!pattern) {
      console.error('❌ Expresión regular no definida');
      return "SIN DATOS";
    }
    const match = text.match(pattern);
    //console.log(`🔍 Buscando con regex: ${pattern}`);
    //console.log(`📌 Resultado encontrado:`, match);
    return match && match[1] ? match[1].trim() : "SIN DATOS";
  }
  // Extraer todos los campos primero
  const fecha = findMatch(text, regexPatterns.fecha);
  const monto = findMatch(text, regexPatterns.monto);
  const nombreEmisor = findMatch(text, regexPatterns.nombreEmisor);
  const cuil = findMatch(text, regexPatterns.cuil);
  const cuentaDestino = findMatch(text, regexPatterns.cuentaDestino);
  let codigoIdentificacion = findMatch(text, regexPatterns.codigoIdentificacion);

  // Generar un código único si no se encuentra uno en el texto
  if (codigoIdentificacion === "SIN DATOS") {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').slice(0, 10); // más corto
    codigoIdentificacion = `GEN-${uniqueId}`;
  }

  return {
    hoy: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),
    fecha,
    np: "NP",
    monto,
    banco: regexPatterns.banco,
    tt: "TT",
    nombreEmisor,
    cuil,
    codigoIdentificacion,
    cuentaDestino,
  };

}

export default extractTransferData;