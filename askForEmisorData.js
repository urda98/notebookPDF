const readlineSync = require('readline-sync');

// Función para solicitar el nombre del emisor si no se encuentra
async function askForEmisorData(data) {
    if (!data.nombreEmisor) {
      data.nombreEmisor = readlineSync.question('Ingrese el nombre del emisor: ');
    }
    return data;
  }
  module.exports = { askForEmisorData };