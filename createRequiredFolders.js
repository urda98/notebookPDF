import fs from 'fs';

function createRequiredFolders() {
  const folders = [
    './temp',
    './temp/todos',
    './temp/comprobantes_csv',
    './temp/comprobantes',
    './temp/comprobantes/Mp',
    './temp/comprobantes/BNA',
    './temp/comprobantes/Santander',
    './temp/comprobantes/CuentaDni',
    './temp/comprobantes/BBVA',
    './temp/comprobantes/BRUBANK',
    './temp/comprobantes/Galicia',
    './temp/comprobantes/Galicia2',
    './temp/comprobantes/AstroPay',
    './temp/comprobantes/BancoCiudad',
    './temp/comprobantes/BancoDelSol',
    './temp/comprobantes/GaliciaMas',
    './temp/comprobantes/NaranjaX',
    './temp/comprobantes/ICBC',
    './temp/comprobantes/Hipotecario',
    './temp/comprobantes/PersonalPay',
    './temp/comprobantes/Provincia',
    './temp/comprobantes/Supervielle',
    './temp/comprobantes/Uala2',
    './temp/comprobantes/Uala',
    './temp/comprobantes/Macro',
    './temp/comprobantes/Lemon',
    './temp/comprobantes/Prex',
    './temp/comprobantes/Patagonia',
    './temp/comprobantes/NBCH'
  ];

  for (const folder of folders) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`📁 Carpeta creada: ${folder}`);
    }
  }
}

export default createRequiredFolders;