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
      cuentaDestino : /Para\s+([A-Za-záéíóúÁÉÍÓÚñÑ\s\.]+)/,
      banco: "MP"
    };
  } else if(folderPath === './comprobantes/BNA/'){
    regexPatterns = {
      fecha: /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
      nombreEmisor: "SIN DATOS",
      monto: /(?:Monto\s*\n?\s*\$?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i,
      cuil: 'SIN DATOS',
      codigoIdentificacion: /(?:Número de transacción\s*\n?\s*)([A-Z0-9]+)/i,
      cuentaDestino: /Destinatario\s*([^\nCUIT]+)/i,
      banco: "BNA"
    } 
  } else if(folderPath === './comprobantes/Santander/'){
    regexPatterns = {
      fecha:  /Fecha de ejecución\s*([\d]{2}\/[\d]{2}\/[\d]{4})/i ,
      nombreEmisor: "SIN DATOS",  
      monto: /Importe debitado\s*\$?\s*([\d.,]+)/i,
      cuil: null, 
      codigoIdentificacion: /N\* comprobante\s+(\d+)/i,
      cuentaDestino: /Titular cuenta destino\s+([^\n]+)\s+Cuenta débito/,
      banco: "SANTANDER"
    }
  } else if(folderPath === './comprobantes/CuentaDni/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,  
      nombreEmisor: /Origen\s+([A-Za-zÁÉÍÓÚÑ\s]+)(?=\s*\d{2,3}(\.\d{3}){2})/i,   
      monto: /Importe\s*\$?\s*([\d.,]+)/i,
      cuil: /CUIL:\s*(\d{2}\.\d{3}\.\d{3})/i,  
      codigoIdentificacion: /Código de referencia\s+([A-Za-z0-9]+)/i,  
      cuentaDestino: /Para\s+([A-Za-z0-9\s\.]+)/i,
      banco: "CUENTADNI" 
    }
  } else if(folderPath === './comprobantes/BBVA/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,
      nombreEmisor: /Titular\s+([\s\S]+?)(?=\s*Destinatario)/i,  
      monto: /\$\s*([\d.,]+)/,  
      cuil: /CUIT destinatario\s*(\d{11})/i, 
      codigoIdentificacion: /Número de referencia\s+(\d+)/i,
      cuentaDestino: /Destinatario\s+([A-Za-z0-9\s\.]+?)(?=\s*CBU)/i,  
      banco: "BBVA" 
    }
  } else if(folderPath === './comprobantes/Galicia/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s*-\s*\d{2}:\d{2}h/i,
      nombreEmisor: /De:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)(?=\s*CUIT)/i,
      monto: /\$?\s?([\d.,]+)\s*\n/i,
      cuil: /CUIT\s*(\d{2}-\d{8}-\d)/i,
      codigoIdentificacion: /ID COELSA\s+(.+)/,
      cuentaDestino: /Para:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+)(?=\s*CUIT)/i,
      banco: "GALICIA" 
    }
  } else if(folderPath === './comprobantes/Galicia2/'){
    regexPatterns = {
      fecha: /Número de operación\s+(\d{2}\/\d{2}\/\d{4})/,
      nombreEmisor: /(.+?)\s+\$\s[\d.]+,\d{2}/,
      monto: /\$\s([\d.]+,\d{2})/,
      cuil: /CUIT\s*(\d{2}-\d{8}-\d)/i,
      codigoIdentificacion: /Número de operación\s+\d{2}\/\d{2}\/\d{4}\s+(\S+)/,
      cuentaDestino: /Razon Social Cu\s+(.+?)\s+\d+/,
      banco: "GALICIA" 
    }
  }else if(folderPath === './comprobantes/BRUBANK/'){
    regexPatterns = {
      fecha: null, 
      nombreEmisor: /Titular\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)(?=\s*CUIT)/i,
      monto: /\$\s?([\d.,]+)/, 
      cuil: /CUIT \/ CUIL\s+(\d{2}-\d{8}-\d)(?=\s*Banco)/i,  
      codigoIdentificacion: /\[\>\s*(\d+)/,
      cuentaDestino: /Envío de dinero\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+)/i,
      banco: "BRUBANK" 
    }
  } else if(folderPath === './comprobantes/AstroPay/'){
    regexPatterns = {
      nombreEmisor: /^([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúÑñ\s]+)/i,  
      monto: " ",  
      cuil: /\b(\d{2}-?\d{8}-?\d)\b/,  
      codigoIdentificacion: "COMPLETAR A MANO",
      banco: "AstroPay" 
    }
  }  else if(folderPath === './comprobantes/BancoCiudad/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s*-\s*\d{2}:\d{2}:\d{2}/,  
      nombreEmisor: " ",  
      monto: /\$\s?([\d.,]+)/,  
      cuil: " ",  
      codigoIdentificacion: " ",  
      banco: "BancoCiudad" 
    }
  } else if(folderPath === './comprobantes/BancoDelSol/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}:\d{2})/, 
      monto: /ARS\s?\$\s?([\d.,]+)/, 
      nombreEmisor: "SIN DATOS",
      codigoIdentificacion: /NRO\.\sCTRL:\s([A-Za-z0-9]+)/, 
      banco: "BancoDelSol" 
    }
  } else if(folderPath === './comprobantes/GaliciaMas/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2})/,  
      monto: /ARS\s([\d.,]+)/,  
      nombreEmisor: /Nombre\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Destino)/i, 
      cuil: "SIN DATOS",
      codigoIdentificacion:  /N\*\s*(\d+)/,
      cuentaDestino: /Nombre\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Banco)/i,
      banco: "GaliciaMas" 
    }
  } else if(folderPath === './comprobantes/NaranjaX/'){
    regexPatterns = {
      fecha: /(\d{2}\/[A-Za-z]{3}\/\d{4})/,
      nombreEmisor: /Cuenta origen\s+NX\s+([A-Za-z\sÁÉÍÓÚÑñ]+)/,
      monto: /\bs\s([\d.,]+)/,
      cuil: /CUIL\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /COELSA ID\s+([\w\d]+)/,
      cuentaDestino: /Cuenta destino\s+e\s+([\p{L}\s.]+?)\s+o BancoVirtual/u,
      banco: "NaranjaX" 
    } 
  } else if(folderPath === './comprobantes/ICBC/'){
    regexPatterns = {
      fecha: /(\d{2} de [A-Za-z]+, \d{4})/,
      nombreEmisor: /De\s([A-Za-z]+\s[A-Za-z]+(?:\s[A-Za-z]+)*)/,
      monto:/\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
      cuil: "SIN DATOS",
      codigoIdentificacion: /Ne de operación:\s+(\S+)/ ,
      cuentaDestino: /a\s+([\p{L}\s.]+?)\s+CUIT\/CUIL:/u,
      banco: "ICBC" 
    }
  } else if(folderPath === './comprobantes/Hipotecario/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/,  
      nombreEmisor: /Nombre:\s([A-Za-z\sÁÉÍÓÚÑñ]+)/,  
      monto: /Monto transferido\s?\$?\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/, 
      cuil: /CUIT:\s(\d{11})/,
      cuentaDestino: /Nombre:\s*([\p{L}\s.]+?)\s*Banco:/u, 
      codigoIdentificacion: /Operación:\s([A-Za-z0-9]+)/,
      banco: "Hipotecario" 
    }
  } else  if(folderPath === './comprobantes/PersonalPay/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/, 
      nombreEmisor: /Envía\s([A-Za-z\sÁÉÍÓÚÑñ,]+)/,  
      monto: /(\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2}))(?=\s*Fecha)/, 
      cuil:  /CUIL\/CUIT\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /CoelsalD (\S+)/,
      cuentaDestino: /Recibe\s([A-Za-z\sÁÉÍÓÚÑñ]+)/,
      banco: "PersonalPay" 
    }
  } else if(folderPath === './comprobantes/Provincia/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})/,
      nombreEmisor: /Titular:\s([A-Za-z\s,]+)\/\s\d{8}/,
      monto: /Importe:\s\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
      cuil: /\/\s(\d+)\sCuenta a debitar:/,
      codigoIdentificacion: /Número de transacción:\s(\d{11})/,
      cuentaDestino: /Titular cuenta destino:\s(.+?)\s\//,
      banco: "Provincia" 
    }
  } else if(folderPath === './comprobantes/Supervielle/'){
    regexPatterns = {
      fecha: /(\d{2} [A-Za-z]+ \d{4})/,
      nombreEmisor: "SIN DATOS",
      monto: /Importe\s\$\s?([\d.]+)(?=%)/,
      cuil: "SIN DATOS",
      codigoIdentificacion: /Número de Control\s([A-Za-z0-9]+)/,
      banco: "Supervielle" 
    } 
  } else if(folderPath === './comprobantes/Uala/'){
    regexPatterns = {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}\s+hs/,  
      nombreEmisor: /Nombre remitente\s([A-Za-z\s]+(?:\s[A-Za-z]+)+)/,  
      monto: /Monto debitado\s\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  
      cuil: /CUIT destino\s(\d{2}-\d{8}-\d)/,  
      codigoIdentificacion: /Id Op.\s([A-Za-z0-9]+)/,
      banco: "Uala" 
    } 
  } else if (folderPath === './comprobantes/Uala2/') {
    regexPatterns = {
        fecha:/Fecha y hora\s([\d\w\s]+?)(?=\s*-\d{2}:\d{2}hs)/, 
        nombreEmisor: /Nombre remitente\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Concepto)/i, 
        monto: /Monto debitado\s?\$([\d.,]+)/,  
        cuil: "SIN DATOS",
        codigoIdentificacion: /Id Op.\s+(\S+)/, 
        cuentaDestino: /Cuenta destino\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)/,
        banco: "Uala"
    }
  } else if (folderPath === './comprobantes/Macro/') {
    regexPatterns = {
        fecha: /(\d{2}\/\d{2}\/\d{4})/, 
        nombreEmisor: "SIN DATOS",  
        monto: /Importe:\s([\d]+\.\d{2})/, 
        cuil: "SIN DATOS",
        codigoIdentificacion: /\d{2}:\d{2}\s(\d+)/,  
        cuentaDestino: /Nombre Beneficiario:\s(.+)/,
        banco: "Macro"        
    } 
  } else if (folderPath === './comprobantes/Lemon/') {
    regexPatterns = {
        fecha: /(\d{1,2} \w+ \d{4} \d{2}:\d{2})\s+hs/, 
        nombreEmisor: /Enviado por\s+(.+)\s+Persona destinataria/,  
        monto:  /ARS (\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/, 
        cuil: "SIN DATOS",
        codigoIdentificacion: /COELSA ID\s+([A-Za-z0-9]+)/,  
        cuentaDestino: /Nombre\s+(.+)\s+CUIT/,
        banco: "Lemon"        
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
    hoy : (new Date()).toISOString().split('T')[0].split('-').reverse().join('/'),
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
}

export default extractTransferData;