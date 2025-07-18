import sharp from 'sharp';
import bankRegexMap from './regexConfig.js';
import fs from 'fs';


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
  const transfer = {
    hoy: (new Date()).toISOString().split('T')[0].split('-').reverse().join('/'),
    fecha: findMatch(text, regexPatterns.fecha),
    np: "NP",
    monto: findMatch(text, regexPatterns.monto),
    banco: regexPatterns.banco,
    tt: "TT",
    nombreEmisor: findMatch(text, regexPatterns.nombreEmisor),
    cuil: findMatch(text, regexPatterns.cuil),
    codigoIdentificacion: findMatch(text, regexPatterns.codigoIdentificacion),
    cuentaDestino: findMatch(text, regexPatterns.cuentaDestino),
  };

  // Generar código alternativo si no existe
  if (
    !transfer.codigoIdentificacion ||
    transfer.codigoIdentificacion === "SIN DATOS"
  ) {
    const fallbackKey = `${transfer.banco}-${transfer.cuil}-${transfer.cuentaDestino}-${transfer.monto}-${transfer.fecha}-${Date.now()}-${Math.random()}`;
    transfer.codigoIdentificacion = `GEN-${Buffer.from(fallbackKey).toString('base64').slice(0, 10)}`;
    console.warn(`⚠️ Se generó códigoIdentificacion alternativo para comprobante sin identificador: ${transfer.codigoIdentificacion}`);
  }

  return transfer;
}

export default extractTransferData;