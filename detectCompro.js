import { createWorker } from 'tesseract.js';
import sharp from 'sharp';


 async function preprocessImage(imagePath) {
  const processedImagePath = `${imagePath}-processed.png`;
  await sharp(imagePath)
    .grayscale()
    .threshold(180)
    .toFile(processedImagePath);
  return processedImagePath;
}

export async function detectCompro(imagePath, folderPath) {
  const processedPath = await preprocessImage(imagePath);
  const { data } = await Tesseract.recognize(processedPath, 'spa', {
    tessedit_char_whitelist: '0123456789$,.',
    logger: (m) => console.log(m),
    oem: 3,
    psm: 3
  });
  const text = data.text;
  //console.log(`📜 Texto extraído:\n${text}\n`);

  var regexPatterns;

      if(folderPath === './comprobantes/Mp/'){
     regexPatterns = {
      fecha: /(?:Fecha de ejecución|Fecha de la transferencia|Día de operación|Miércoles,|Martes,|Jueves,|Viernes,|Sábado,|Domingo,|Lunes,)\s*([\d]{1,2}\sde\s\w+\sde\s\d{4})/i,
      nombreEmisor: /\* De\s*([\w\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*CUIT)/i,
      monto: /(?:Importe debitado|Monto transferido|Total a pagar|Monto)[^\d]*\$?\s?([\d\.,]+)/i,
      cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{7,8}-?\d)/i,
      codigoIdentificacion: /(?:Código de identificación)[^\w]*(\w+)/i,
      cuentaDestino : /Para\s+([A-Za-záéíóúÁÉÍÓÚñÑ\s\.]+)/,
      banco: "MP"
    };
  }


  function findMatch(text, pattern) {
    if (!pattern) {
      console.error('❌ Expresión regular no definida');
      return "SIN DATOS";
    }
    const match = text.match(pattern);
    console.log(`🔍 Buscando con regex: ${pattern}`);
    console.log(`📌 Resultado encontrado:`, match);
    return match && match[1] ? match[1].trim() : "SIN DATOS";
  }

  return {


  };
}

export default extractTransferData;