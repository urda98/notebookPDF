    const fs = require('fs');
    const pdfParse = require('pdf-parse');

    // Función para extraer datos del PDF
    async function extractPdfData(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text;

    // Expresiones regulares para extraer los datos
    const fechaMatch = text.match(/([A-Za-z]+, \d{1,2} de [A-Za-z]+ de \d{4} a las \d{1,2}:\d{2} hs)/);
    const nombreEmisorMatch = text.match(/De\s*\n([A-Za-zÁÉÍÓÚáéíóúüÜñÑ ]+)/);
    const cuilMatch = text.match(/CUIT\/CUIL:\s*([\d-]+)/);
    const montoMatch = text.match(/\$\s*([\d\.]+)/);
    const codigoIdentificacionMatch = text.match(/Código de identificación\s*\n([A-Z0-9]+)/);

    return {
        fecha: fechaMatch ? fechaMatch[1] : null,
        nombreEmisor: nombreEmisorMatch ? nombreEmisorMatch[1] : null,
        cuil: cuilMatch ? cuilMatch[1] : null,
        monto: montoMatch ? montoMatch[1] : null,
        codigoIdentificacion: codigoIdentificacionMatch ? codigoIdentificacionMatch[1] : null
    };
    }

    module.exports = { extractPdfData };