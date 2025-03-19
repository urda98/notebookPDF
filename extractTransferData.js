import Tesseract from 'tesseract.js';
import sharp from 'sharp';


 async function preprocessImage(imagePath) {
  const processedImagePath = `${imagePath}-processed.png`;
  await sharp(imagePath)
    .grayscale()
    .threshold(180)
    .toFile(processedImagePath);
  return processedImagePath;
}

export async function extractTransferData(imagePath, folderPath) {
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

      if(folderPath === './comprobantes/Mp/'){
     regexPatterns = {
      fecha: /(?:Fecha de ejecución|Fecha de la transferencia|Día de operación|Miércoles,|Martes,|Jueves,|Viernes,|Sábado,|Domingo,|Lunes,)\s*([\d]{1,2}\sde\s\w+\sde\s\d{4})/i,
      nombreEmisor: /\* De\s*([\w\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*CUIT)/i,
      monto: /(?:Importe debitado|Monto transferido|Total a pagar|Monto)[^\d]*\$?\s?([\d\.,]+)/i,
      cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{7,8}-?\d)/i,
      codigoIdentificacion: /(?:Código de identificación)[^\w]*(\w+)/i,
      banco: "MP"
    };
  } else if(folderPath === './comprobantes/BNA/'){
    regexPatterns = {
      fecha: /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
      nombreEmisor: /[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑ\s]+/,
      monto: /(?:Monto\s*\n?\s*\$?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i,
      cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{8}-?\d)/i,
      codigoIdentificacion: /(?:Número de transacción\s*\n?\s*)([A-Z0-9]+)/i,
      banco: "BNA"
    } 
  } else if(folderPath === './comprobantes/Santander'){
    regexPatterns = {
      fecha:  /Fecha de ejecución\s*([\d]{2}\/[\d]{2}\/[\d]{4})/i ,
      nombreEmisor: null,
      monto: /Importe debitado\s*\$?\s*([\d.,]+)/i,
      cuil: null, 
      codigoIdentificacion: /N\* comprobante\s+(\d+)/i,
      banco: "SANTANDER"
    }
  }
  if(folderPath === './comprobantes/CuentaDni/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,  
      nombreEmisor: /Origen\s+([A-Za-zÁÉÍÓÚÑ\s]+)(?=\s*\d{2,3}(\.\d{3}){2})/i,   
      monto: /Importe\s*\$?\s*([\d.,]+)/i,
      cuil: /CUIL:\s*([\d]{2}\.[\d]{3}\.[\d]{3})/i,  
      codigoIdentificacion: /Código de referencia\s+([A-Za-z0-9]+)/i,  
      banco: "CUENTADNI" 
    }
  } if(folderPath === './comprobantes/BBVA/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,
      nombreEmisor: /Titular\s+([\s\S]+?)(?=\s*Destinatario)/i,  
      monto: /\$\s*([\d.,]+)/,  
      cuil: /CUIT destinatario\s*(\d{11})/i, 
      codigoIdentificacion: /Número de referencia\s+(\d+)/i,  
      banco: "BBVA" 
    }
  } if(folderPath === './comprobantes/Galicia/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s*-\s*\d{2}:\d{2}h/i,
      nombreEmisor: /De:\s*([\w\sÁÉÍÓÚáéíóúÑñ]+)/i,
      monto: /\$?\s?([\d.,]+)\s*\n/i,
      cuil: /CUIT\s*(\d{2}-\d{8}-\d)/i,
      codigoIdentificacion: /N\* de operación\s*(\d+)/i,
      banco: "GALICIA" 
    }
  } if(folderPath === './comprobantes/BRUBANK/'){
    regexPatterns = {
      fecha: null, 
      nombreEmisor: /([A-Za-zÁÉÍÓÚáéíóúÑñ]+\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+){2,})/i,
      monto: /\$\s?([\d.,]+)/, 
      cuil: /(\d{2}-\d{8}-\d)\s*(?=\w+\s*Brubank)/i,  
      codigoIdentificacion: /\[\>\s*(\d+)/,
      banco: "BRUBANK" 
    }
  } if(folderPath === './comprobantes/AstroPay/'){
    regexPatterns = {
      nombreEmisor: /^([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúÑñ\s]+)/i,  
      monto: " ",  
      cuil: /\b(\d{2}-?\d{8}-?\d)\b/,  
      codigoIdentificacion: "COMPLETAR A MANO",
      banco: "AstroPay" 
    }
  }  if(folderPath === './comprobantes/BancoCiudad/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s*-\s*\d{2}:\d{2}:\d{2}/,  
      nombreEmisor: " ",  
      monto: /\$\s?([\d.,]+)/,  
      cuil: " ",  
      codigoIdentificacion: " ",  
      banco: "BancoCiudad" 
    }
  } if(folderPath === './comprobantes/BancoDelSol/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}:\d{2})/, 
      monto: /ARS\s?\$\s?([\d.,]+)/, 
      nombreEmisor: "SIN DATOS",
      codigoIdentificacion: /NRO\.\sCTRL:\s([A-Za-z0-9]+)/, 
      banco: "BancoDelSol" 
    }
  } if(folderPath === './comprobantes/GaliciaMas/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2})/,  
      monto: " ",  
      nombreEmisor: /Nombre\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Destino)/i, 
      cuil: "SIN DATOS",
      codigoIdentificacion: "SIN DATOS",
      banco: "GaliciaMas" 
    }
  } if(folderPath === './comprobantes/NaranjaX/'){
    regexPatterns = {
      fecha: /(\d{2}\/[A-Za-z]{3}\/\d{4})/,
      nombreEmisor: /Cuenta origen\s+NX\s+([A-Za-z\sÁÉÍÓÚÑñ]+)/,
      monto: /\bs\s([\d.,]+)/,
      cuil: /CUIL\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /Código de transacción\s([a-f0-9-]+)/,
      banco: "NaranjaX" 
    } 
  } if(folderPath === './comprobantes/ICBC/'){
    regexPatterns = {
      fecha: /(\d{2} de [A-Za-z]+, \d{4})/,
      nombreEmisor: /De\s([A-Za-z]+\s[A-Za-z]+(?:\s[A-Za-z]+)*)/,
      monto:/\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
      cuil: /CUIT\/CUIL:\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /N\* de operación:\s([A-Za-z0-9]+)/ ,
      banco: "ICBC" 
    }
  } if(folderPath === './comprobantes/Hipotecario/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/,  
      nombreEmisor: /Nombre:\s([A-Za-z\sÁÉÍÓÚÑñ]+)/,  
      monto: /Monto transferido\s?\$?\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/, 
      cuil: /CUIT:\s(\d{11})/, 
      codigoIdentificacion: /Operación:\s([A-Za-z0-9]+)/,
      banco: "Hipotecario" 
    }
  }  if(folderPath === './comprobantes/PersonalPay/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/, 
      nombreEmisor: /Envía\s([A-Za-z\sÁÉÍÓÚÑñ,]+)/,  
      monto: /Enviaste\s+dinero\s+5\s+([\d.,]+)/, 
      cuil: /CUIL\/CUIT\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /NS de la\s([A-Za-z0-9]+)/,
      banco: "PersonalPay" 
    }
  } if(folderPath === './comprobantes/Provincia/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/,
      nombreEmisor: /Titular:\s([A-Za-z\s,]+)\/\s\d{8}/,
      monto: /Importe:\s\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
      cuil: /Titular\s cuenta\s destino:\s([A-Za-z\s\.]+\/\s?(\d{2}-\d{8}))/,
      codigoIdentificacion: /Número de transacción:\s(\d{11})/,
      banco: "Provincia" 
    }
  } if(folderPath === './comprobantes/Supervielle/'){
    regexPatterns = {
      fecha: /(\d{2} [A-Za-z]+ \d{4})/,
      nombreEmisor: "SIN DATOS",
      monto: /Importe\s\$\s?([\d.]+)(?=%)/,
      cuil: "SIN DATOS",
      codigoIdentificacion: /Número de Control\s([A-Za-z0-9]+)/,
      banco: "Supervielle" 
    } 
  }  if(folderPath === './comprobantes/Uala/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}\s+hs/,  // Fecha (ej. "17/03/2025")
      nombreEmisor: /Nombre remitente\s([A-Za-z\s]+(?:\s[A-Za-z]+)+)/,  // Nombre del remitente
      monto: /Monto debitado\s\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  // Captura monto en formato correcto
      cuil: /CUIT destino\s(\d{2}-\d{8}-\d)/,  // Cuil destino (CUIT)
      codigoIdentificacion: /Id Op.\s([A-Za-z0-9]+)/,
      banco: "Uala" 
    } 
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
    fecha: findMatch(text, regexPatterns.fecha),
    nombreEmisor: findMatch(text, regexPatterns.nombreEmisor),
    monto: findMatch(text, regexPatterns.monto),
    cuil: findMatch(text, regexPatterns.cuil),
    codigoIdentificacion: findMatch(text, regexPatterns.codigoIdentificacion),
    banco: regexPatterns.banco
  };
}

export default extractTransferData;