const bankRegexMap = {
  './temp/comprobantes/Mp/': {
    fecha: /(?:Fecha de ejecución|Fecha de la transferencia|Día de operación|Miércoles,|Martes,|Jueves,|Viernes,|Sábado,|Domingo,|Lunes,)\s*([\d]{1,2}\sde\s\w+\sde\s\d{4})/i,
    nombreEmisor: /\* De\s*([\w\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*CUIT)/i,
    monto: /\$\s*([\d\.,]+)\s*Motivo:/i,
    cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{7,8}-?\d)/i,
    codigoIdentificacion: /(?:Código de identificación)[^\w]*(\w+)/i,
    cuentaDestino : /Para\s+([A-Za-záéíóúÁÉÍÓÚñÑ\s\.]+)/,
    banco: "MP"
  },
  './temp/comprobantes/BNA/': {
    fecha: /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
    nombreEmisor: "SIN DATOS",
    monto: /(?:Monto\s*\n?\s*\$?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i,
    cuil: 'SIN DATOS',
    codigoIdentificacion: /(?:Número de transacción\s*\n?\s*)([A-Z0-9]+)/i,
    cuentaDestino: /Destinatario\s*([^\nCUIT]+)/i,
    banco: "BNA"
  },
   './temp/comprobantes/Santander/':{
      fecha:  /Fecha de ejecución\s*([\d]{2}\/[\d]{2}\/[\d]{4})/i , /*/Fecha\s+(\d{2}\/\d{2}\/\d{4})\s+Número de Comprobante/*/
      nombreEmisor: "SIN DATOS",  
      monto: /Importe debitado\s*\$?\s*([\d.,]+)/i,
      cuil: null, 
      codigoIdentificacion: /N\* comprobante\s+(\d+)/i,
      cuentaDestino: /Titular cuenta destino\s+([^\n]+)\s+Cuenta débito/,
      banco: "SANTANDER"
  },
  './temp/comprobantes/CuentaDni/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,  
      nombreEmisor: /Origen\s+([A-Za-zÁÉÍÓÚÑ\s]+)(?=\s*\d{2,3}(\.\d{3}){2})/i,   
      monto: /Importe\s*\n?.*?(\d{1,3}(?:\.\d{3})*,\d{2})\s*\nOrigen/i,
      cuil: /Origen\s*\n.*?\n(\d{2}\.\d{3}\.\d{3})\s*\nPara/i,  
      codigoIdentificacion: /Código de referencia\s+([A-Za-z0-9]+)/i,  
      cuentaDestino: /Para\s+([A-Za-z0-9\s\.]+)/i,
      banco: "CUENTADNI" 
  },
  './temp/comprobantes/BBVA/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})/i,
      nombreEmisor: /Titular\s+([\s\S]+?)(?=\s*Destinatario)/i,  
      monto: /\$\s*([\d.,]+)/,  
      cuil: /CUIT destinatario\s*(\d{11})/i, 
      codigoIdentificacion: /Número de referencia\s+(\d+)/i,
      cuentaDestino: /Destinatario\s+([A-Za-z0-9\s\.]+?)(?=\s*CBU)/i,  
      banco: "BBVA" 
  },
  './temp/comprobantes/Galicia/': {
      fecha: /(\d{2}\/\d{2}\/\d{4})\s*-\s*\d{2}:\d{2}h/i,
      nombreEmisor: /De:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)(?=\s*CUIT)/i,
      monto: /\$?\s?([\d.,]+)\s*\n/i,
      cuil: /CUIT\s*(\d{2}-\d{8}-\d)/i,
      codigoIdentificacion: /ID COELSA\s+(.+)/,
      cuentaDestino: /Para:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+)(?=\s*CUIT)/i,
      banco: "GALICIA" 
  },
/*   './temp/comprobantes/Galicia/':{
      fecha: /Número de operación\s+(\d{2}\/\d{2}\/\d{4})/,
      nombreEmisor: /(.+?)\s+\$\s[\d.]+,\d{2}/,
      monto: /\$\s([\d.]+,\d{2})/,
      cuil: /CUIT\s*(\d{2}-\d{8}-\d)/i,
      codigoIdentificacion: /Número de operación\s+\d{2}\/\d{2}\/\d{4}\s+(\S+)/,
      cuentaDestino: /Razon Social Cu\s+(.+?)\s+\d+/,
      banco: "GALICIA" 
    }, */
  './temp/comprobantes/BRUBANK/':{
      fecha: null, 
      nombreEmisor: /Titular\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)(?=\s*CUIT)/i,
      monto: /\$\s?([\d.,]+)/, 
      cuil: /CUIT \/ CUIL\s+(\d{2}-\d{8}-\d)(?=\s*Banco)/i,  
      codigoIdentificacion: /\[\>\s*(\d+)/,
      cuentaDestino: /Envío de dinero\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+)/i,
      banco: "BRUBANK" 
    },
    './temp/comprobantes/AstroPay/':{
      nombreEmisor: /^([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúÑñ\s]+)/i,  
      monto: " ",  
      cuil: /\b(\d{2}-?\d{8}-?\d)\b/,  
      codigoIdentificacion: "COMPLETAR A MANO",
      banco: "AstroPay" 
    },
    './temp/comprobantes/BancoCiudad/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})\s*-\s*\d{2}:\d{2}:\d{2}/,  
      nombreEmisor: /Originante\s+Cuenta\s+Origen\s+([A-ZÑÁÉÍÓÚÜ]+)\s+CA\b/i,  
      monto: /\$\s?([\d.,]+)/,  
      cuil: /CUIL\/CUIT\s*[:\-]?\s*(\d{2}-\d{8}-\d)/i,  
      codigoIdentificacion: /Identificador de operación\s*[:\-]?\s*([A-Z0-9]{10,})/i,
      cuentaDestino:/ALIAS\s*[:\-]?\s*([\w.-]+)/i,  
      banco: "BancoCiudad" 
    },
    './temp/comprobantes/BancoDelSol/':{
      fecha: /(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}:\d{2})/, 
      monto: /ARS\s?\$\s?([\d.,]+)/, 
      nombreEmisor: "SIN DATOS",
      codigoIdentificacion: /NRO\.\sCTRL:\s([A-Za-z0-9]+)/,
      cuentaDestino: /DESTINATARIO:\s+(.+?)\s+CVU DESTINO:/, 
      banco: "BancoDelSol" 
    },
    './temp/comprobantes/GaliciaMas/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2})/,  
      monto: /ARS\s([\d.,]+)/,  
      nombreEmisor: /Nombre\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Destino)/i, 
      cuil: "SIN DATOS",
      codigoIdentificacion:  /N\*\s*(\d+)/,
      cuentaDestino: /Nombre\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Banco)/i,
      banco: "GaliciaMas" 
    },
    './temp/comprobantes/NaranjaX/':{
      fecha: /(\d{2}\/[A-Za-z]{3}\/\d{4})/,
      nombreEmisor: /Cuenta origen\s+NX\s+([A-Za-z\sÁÉÍÓÚÑñ]+)/,
      monto: /\bs\s([\d.,]+)/,
      cuil: /CUIL\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /COELSA ID\s+([\w\d]+)/,
      cuentaDestino: /Cuenta destino\s+e\s+([\p{L}\s.]+?)\s+o BancoVirtual/u,
      banco: "NaranjaX" 
    }, 
    './temp/comprobantes/ICBC/':{
      fecha: /(\d{2} de [A-Za-z]+, \d{4})/,
      nombreEmisor: /De\s([A-Za-z]+\s[A-Za-z]+(?:\s[A-Za-z]+)*)/,
      monto:/\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
      cuil: "SIN DATOS",
      codigoIdentificacion: /N[°º\?]?\s*de\s*operación[:\s]*([A-Z0-9]+)\s*Transferiste/i ,
      cuentaDestino: /a\s+([\p{L}\s.]+?)\s+CUIT\/CUIL:/u,
      banco: "ICBC" 
    },
    './temp/comprobantes/Hipotecario/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})/,  
      nombreEmisor: /Nombre:\s([A-Za-z\sÁÉÍÓÚÑñ]+)/,  
      monto: /Monto transferido\s?\$?\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/, 
      cuil: /CUIT:\s(\d{11})/,
      cuentaDestino: /Nombre:\s*([\p{L}\s.]+?)\s*Banco:/u, 
      codigoIdentificacion: /Operación:\s([A-Za-z0-9]+)/,
      banco: "Hipotecario" 
    },
    './temp/comprobantes/PersonalPay/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})/, 
      nombreEmisor: /Envía\s([A-Za-z\sÁÉÍÓÚÑñ,]+)/,  
      monto: /(\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2}))(?=\s*Fecha)/, 
      cuil:  /CUIL\/CUIT\s(\d{2}-\d{8}-\d)/,
      codigoIdentificacion: /CoelsalD (\S+)/,
      cuentaDestino: /Recibe\s([A-Za-z\sÁÉÍÓÚÑñ]+)/,
      banco: "PersonalPay" 
    },
    './temp/comprobantes/Provincia/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})/,
      nombreEmisor: /Titular:\s([A-Za-z\s,]+)\/\s\d{8}/,
      monto: /Importe:\s\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
      cuil: /\/\s(\d+)\sCuenta a debitar:/,
      codigoIdentificacion: /Número de transacción:\s(\d{11})/,
      cuentaDestino: /Titular cuenta destino:\s(.+?)\s\//,
      banco: "Provincia" 
    },
    './temp/comprobantes/Supervielle/':{
      fecha: /(\d{2} [A-Za-z]+ \d{4})/,
      nombreEmisor: "SIN DATOS",
      monto: /Importe\s\$\s?([\d.]+)(?=%)/,
      cuil: "SIN DATOS",
      codigoIdentificacion: /Número de Control\s([A-Za-z0-9]+)/,
      banco: "Supervielle" 
    }, 
    './temp/comprobantes/Uala/':{
      fecha: /(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}\s+hs/,  
      nombreEmisor: /Nombre remitente\s([A-Za-z\s]+(?:\s[A-Za-z]+)+)/,  
      monto: /Monto debitado\s\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  
      cuil: /CUIT destino\s(\d{2}-\d{8}-\d)/,  
      codigoIdentificacion: /Id Op.\s([A-Za-z0-9]+)/,
      banco: "Uala" 
    }, 
    './temp/comprobantes/Uala/':{
        fecha:/Fecha y hora\s([\d\w\s]+?)(?=\s*-\d{2}:\d{2}hs)/, 
        nombreEmisor: /Nombre remitente\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)(?=\s*Concepto)/i, 
        monto: /Monto debitado\s?\$([\d.,]+)/,  
        cuil: "SIN DATOS",
        codigoIdentificacion: /Id Op.\s+(\S+)/, 
        cuentaDestino: /Cuenta destino\s([A-Za-z\sÁÉÍÓÚáéíóúÑñ]+)/,
        banco: "Uala"
    },
    './temp/comprobantes/Macro/':{
        fecha: /(\d{2}\/\d{2}\/\d{4})/, 
        nombreEmisor: "SIN DATOS",  
        monto: /Importe:\s([\d]+\.\d{2})/, 
        cuil: "SIN DATOS",
        codigoIdentificacion: /\d{2}:\d{2}\s(\d+)/,  
        cuentaDestino: /Nombre Beneficiario:\s(.+)/,
        banco: "Macro"        
    }, 
    './temp/comprobantes/Lemon/':{
        fecha: /(\d{1,2} \w+ \d{4} \d{2}:\d{2})\s+hs/, 
        nombreEmisor: /Enviado por\s+(.+)\s+Persona destinataria/,  
        monto:  /ARS (\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/, 
        cuil: "SIN DATOS",
        codigoIdentificacion: /COELSA ID\s+([A-Za-z0-9]+)/,  
        cuentaDestino: /Nombre\s+(.+)\s+CUIT/,
        banco: "Lemon"        
    },
    './temp/comprobantes/Prex/':{
      fecha: /(\d{1,2} de [A-Za-zÁÉÍÓÚñáéíóú]+ de \d{4})(?=\s*-)/, 
      nombreEmisor: /Titular:\s*(.+?)\s*CVU\/CBU:/,  
      monto:  /Enviaste:\s*\$?\s*([\d.]+,\d{2})/, 
      cuil: "SIN DATOS",
      codigoIdentificacion: /Código[:\s]*([A-Z0-9]+)/,  
      cuentaDestino: /Enviaste a:\s*(.+)/,
      banco: "Prex" 
    },
    './temp/comprobantes/Patagonia/':{
      fecha: /Fecha y Hora\s+(\d{2}\/\d{2}\/\d{4})/i, 
      nombreEmisor: /Origen\s+([A-ZÁÉÍÓÚÑ ,.'-]+)/i,  
      monto:  /Importe\s*\$ ?([\d.]+,\d{2})/i, 
      cuil: "SIN DATOS",
      codigoIdentificacion: /N9 de control\s+([A-Z0-9]+)/i,  
      cuentaDestino: /Destino\s+([A-ZÁÉÍÓÚÑ0-9 ,.'-]+)/i,
      banco: "PATAGONIA" 
    },
    './temp/comprobantes/NBCH/':{
      fecha: /Fecha:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, 
      nombreEmisor: /Nombre originante:\s*(.+)/i,  
      monto:  /\$\s*([\d.]+,\d{2})/, 
      cuil: /CUIT\/CUIL\/CDI\/DNI originante:\s*(\d{11})/i,
      codigoIdentificacion: /Código de identificación:\s*([A-Z0-9]+)/i,  
      cuentaDestino: /Destinatario\s+([A-Z\s.]+)/i,
      banco: "NBCH" 
    }
  };

  export default bankRegexMap;