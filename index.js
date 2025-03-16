      const fs = require('fs');
      const path = require('path');
      const Tesseract = require('tesseract.js');
      const xml2js = require('xml2js');
      const { parse } = require('json2csv');
      
      // const carpetaComprobantes = './comprobantes/'; // 📂 Ruta de la carpeta
      const carpetaComprobantes = './Mp/';

      async function extractTransferData(imagePath) {
        const { data } = await Tesseract.recognize(imagePath, 'spa');
        const text = data.text;
        console.log(`📜 Texto extraído:\n${text}\n`); 

        const regexPatterns = {
          fecha: /(?:Fecha de ejecución|Fecha de la transferencia|Día de operación|Miércoles,|Martes,|Jueves,|Viernes,|Sábado,|Domingo,|Lunes,)\s*([\d]{1,2}\sde\s\w+\sde\s\d{4})/i,
          nombreEmisor: /(?:"* De"|Remitente|Ordenante|Titular de la cuenta)[^\w]*([\w\sÁÉÍÓÚáéíóúÑñ]+)/i,
          monto: /(?:Importe debitado|Monto transferido|Total a pagar|Monto)[^\d]*\$?\s?([\d\.,]+)/i,
          cuil: /(?:CUIT|CUIL|DNI|Identificación fiscal)[^\d]*(\d{2}-?\d{7,8}-?\d)/i,
          codigoIdentificacion: /(?:Código de identificación)[^\w]*(\w+)/i,  // Ajustado para capturar "Código de identificación"
          banco: /(?:Banco|Entidad emisora|Institución financiera|Mercado Pago)/i
        };

      
        function findMatch(text, pattern) {
          const match = text.match(pattern);
          if (match) return match[1].trim();
          return null;
        }
      
        return {
          fecha: findMatch(text, regexPatterns.fecha),
          nombreEmisor: findMatch(text, regexPatterns.nombreEmisor),
          monto: findMatch(text, regexPatterns.monto)/* ?.replace('.', ',') */, 
          cuil: findMatch(text, regexPatterns.cuil),
          codigoIdentificacion: findMatch(text, regexPatterns.codigoIdentificacion)
        };
      }
      
      // ✅ Generar XML para cada archivo
      function generateXML(data, fileName) {
        const builder = new xml2js.Builder();
        const xml = builder.buildObject({ transferencia: data });
        fs.writeFileSync(`comprobantes_xml/${fileName}.xml`, xml, 'utf-8');
        console.log(`📂 XML guardado: comprobantes_xml/${fileName}.xml`);
      }
      
      // ✅ Acumular datos para el CSV
      let allTransferData = [];
      
      // ✅ Procesar todos los archivos en la carpeta
      async function processAllImages() {
        if (!fs.existsSync('comprobantes_xml')) fs.mkdirSync('comprobantes_xml');
        if (!fs.existsSync('comprobantes_csv')) fs.mkdirSync('comprobantes_csv');
      
        fs.readdir(carpetaComprobantes, async (err, files) => {
          if (err) {
            console.error("❌ Error al leer la carpeta:", err);
            return;
          }
      
          for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].includes(ext)) {
              const filePath = path.join(carpetaComprobantes, file);
              console.log(`🔍 Procesando: ${filePath}`);
      
              try {
                const transferData = await extractTransferData(filePath);
                const fileName = path.parse(file).name; // Nombre sin extensión
                generateXML(transferData, fileName);
                allTransferData.push(transferData); // Acumula los datos para el CSV
              } catch (error) {
                console.error(`❌ Error procesando ${file}:`, error);
              }
            }
          }
      
          // Después de procesar todos los archivos, genera el archivo CSV
          const csv = parse(allTransferData, { fields: Object.keys(allTransferData[0]) });
          fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
          console.log('📂 CSV guardado: comprobantes_csv/todos_comprobantes.csv');
        });
      }
      
      // 📌 Ejecutar la función
      processAllImages();
      

  

/* const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const xml2js = require('xml2js');
const { parse } = require('json2csv');

const carpetaComprobantes = './comprobantes/'; // 📂 Ruta de la carpeta

async function extractTransferData(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'spa');
  const text = data.text;

  const regexPatterns = {
    fecha: /(\w+), (\d{1,2} de \w+ de \d{4})/i,
    nombreEmisor: /De\n([\w\sáéíóúÁÉÍÓÚñÑ]+)/i,
    cuil: /CUIT\/CUIL: (\d{2}-\d{8}-\d{1})/i,
    codigoIdentificacion: /Número de operación de Mercado Pago\s*(\d+)/i,
  };

  function findMatch(pattern) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
    return null;
  }

  return {
    fecha: findMatch(regexPatterns.fecha),
    nombreEmisor: findMatch(regexPatterns.nombreEmisor),
    cuil: findMatch(regexPatterns.cuil),
    codigoIdentificacion: findMatch(regexPatterns.codigoIdentificacion),
  };
}

// ✅ Generar XML para cada archivo
function generateXML(data, fileName) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ transferencia: data });
  fs.writeFileSync(`comprobantes_xml/${fileName}.xml`, xml, 'utf-8');
  console.log(`📂 XML guardado: comprobantes_xml/${fileName}.xml`);
}

// ✅ Acumular datos para el CSV
let allTransferData = [];

// ✅ Procesar todos los archivos en la carpeta
async function processAllImages() {
  if (!fs.existsSync('comprobantes_xml')) fs.mkdirSync('comprobantes_xml');
  if (!fs.existsSync('comprobantes_csv')) fs.mkdirSync('comprobantes_csv');

  fs.readdir(carpetaComprobantes, async (err, files) => {
    if (err) {
      console.error("❌ Error al leer la carpeta:", err);
      return;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const filePath = path.join(carpetaComprobantes, file);
        console.log(`🔍 Procesando: ${filePath}`);

        try {
          const transferData = await extractTransferData(filePath);
          const fileName = path.parse(file).name; // Nombre sin extensión
          generateXML(transferData, fileName);
          allTransferData.push(transferData); // Acumula los datos para el CSV
        } catch (error) {
          console.error(`❌ Error procesando ${file}:`, error);
        }
      }
    }

    // Después de procesar todos los archivos, genera el archivo CSV
    const csv = parse(allTransferData, { fields: Object.keys(allTransferData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado: comprobantes_csv/todos_comprobantes.csv');
  });
}

// 📌 Ejecutar la función
processAllImages();
 */



/* const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const xml2js = require('xml2js');
const { parse } = require('json2csv');

const carpetaComprobantes = './comprobantes/'; // 📂 Ruta de la carpeta

// Expresiones regulares ampliadas para capturar los diferentes formatos de datos
    const regexPatterns = {
        fecha: [
          /(?:Fecha de ejecución|Fecha de operación|Fecha|Emitido el|Día de operación|Transacción realizada el)[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
          /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, // Alternativa sin palabras clave
          /(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i, // Alternativa con formato año
        ],
        nombreEmisor: [
          /(?:Titular cuenta destino|Titular de la cuenta|Nombre del destinatario|Remitente|Origen de la transacción|Beneficiario|Pagador)[^\w]*([\w\sÁÉÍÓÚáéíóúÑñ]+)/i,
          /(?:Emisor|Pagador)[^\w]*([\w\sÁÉÍÓÚáéíóúÑñ]+)/i, // Para casos con diferentes variaciones
          /(?:Remitente|Beneficiario)[^\w]*([\w\sÁÉÍÓÚáéíóúÑñ]+)/i, // Otro caso posible
        ],
        monto: [
          /(?:Importe debitado|Monto total|Valor de la operación|Importe|Monto transferido|Total a pagar|Monto a debitar)[^\d]*\$?\s*([\d,.]+)/i,
          /([\d,.]+)/i, // Caso más genérico
        ],
        cuil: [
          /(?:CUIT|CUIL|DNI|Identificación fiscal|N[º°]? Documento)[^\d]*(\d{2}-?\d{7,8}-?\d{1})/i,
          /(\d{2}-\d{7,8}-\d{1})/i, // Caso alternativo si no se menciona CUIT o CUIL
        ],
        codigoIdentificacion: [
          /(?:N[º°]?\s*comprobante|Referencia|Número de operación|ID de transacción|Código de operación|Comprobante N°|Nro. de transacción|Código de confirmación)[^\d]*(\d+)/i,
          /(\d{12,})/i, // Caso genérico para un número largo
        ],
};

// Función para encontrar una coincidencia con las expresiones regulares
function findMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

// Función para extraer los datos de la transferencia
async function extractTransferData(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'spa');
  let text = data.text;

  // Eliminar saltos de línea y caracteres extraños
  text = text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');

  return {
    fecha: findMatch(text, regexPatterns.fecha),
    nombreEmisor: findMatch(text, regexPatterns.nombreEmisor),
    monto: findMatch(text, regexPatterns.monto)?.replace(',', '.'), // Normaliza decimales
    cuil: findMatch(text, regexPatterns.cuil),
    codigoIdentificacion: findMatch(text, regexPatterns.codigoIdentificacion),
  };
}

// Generar XML para cada archivo
function generateXML(data, fileName) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ transferencia: data });
  fs.writeFileSync(`comprobantes_xml/${fileName}.xml`, xml, 'utf-8');
  console.log(`📂 XML guardado: comprobantes_xml/${fileName}.xml`);
}

// Acumular datos para el CSV
let allTransferData = [];

// Procesar todos los archivos en la carpeta
async function processAllImages() {
  if (!fs.existsSync('comprobantes_xml')) fs.mkdirSync('comprobantes_xml');
  if (!fs.existsSync('comprobantes_csv')) fs.mkdirSync('comprobantes_csv');

  fs.readdir(carpetaComprobantes, async (err, files) => {
    if (err) {
      console.error("❌ Error al leer la carpeta:", err);
      return;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const filePath = path.join(carpetaComprobantes, file);
        console.log(`🔍 Procesando: ${filePath}`);

        try {
          const transferData = await extractTransferData(filePath);
          const fileName = path.parse(file).name; // Nombre sin extensión
          generateXML(transferData, fileName);
          allTransferData.push(transferData); // Acumula los datos para el CSV
        } catch (error) {
          console.error(`❌ Error procesando ${file}:`, error);
        }
      }
    }

    // Después de procesar todos los archivos, genera el archivo CSV
    const csv = parse(allTransferData, { fields: Object.keys(allTransferData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado: comprobantes_csv/todos_comprobantes.csv');
  });
}

// Ejecutar la función
processAllImages();
 */


