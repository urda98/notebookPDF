import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import  generateXML  from './generateXML.js';
import  extractTransferData from './extractTransferData.js';
/* 
const app = express();
const port = 3000;

// Función de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define la carpeta principal 'uploads'
    const uploadsFolder = path.join(__dirname, 'uploads');
    
    // Determina a qué subcarpeta se debe guardar el archivo
    let folder = '';

    // Aquí puedes elegir en qué carpeta se guardará dependiendo de algún parámetro
    // Puedes usar req.body o req.query para obtener el nombre de la carpeta, o alguna lógica.
    if (req.body.folder === 'MP') {
      folder = path.join(uploadsFolder, 'MP');
    } else if (req.body.folder === 'Bbva') {
      folder = path.join(uploadsFolder, 'Bbva');
    } else if (req.body.folder === 'Santander') {
      folder = path.join(uploadsFolder, 'Santander');
    } else {
      // Si no se proporciona ninguna carpeta, por defecto usamos 'Otros'
      folder = path.join(uploadsFolder, 'Otros');
    }

    // Si la carpeta no existe, crearla
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // Pasar la ruta de la carpeta al callback
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Se genera un nombre único para el archivo
    cb(null, ${Date.now()}-${file.originalname});
  },
});

// Configuración de Multer
const upload = multer({ storage });

module.exports = upload;

app.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    // Aquí procesas los archivos cargados
    const files = req.files.map(file => file.path);
    console.log('Archivos cargados:', files);

    // Procesar imágenes y generar CSV
    await processFiles(files); // Tu función para procesar imágenes y generar el CSV

    // Generar el archivo CSV (esto depende de cómo generas el CSV)
    const csvPath = path.join(__dirname, 'comprobantes_csv/todos_comprobantes.csv');
    res.download(csvPath, 'todos_comprobantes.csv', (err) => {
      if (err) {
        console.error('Error descargando el archivo CSV', err);
        res.status(500).send('Error al descargar el archivo');
      }
    });
  } catch (error) {
    console.error('Error procesando los archivos:', error);
    res.status(500).send('Error al procesar los archivos');
  }
});


app.use(express.static('public'));


app.listen(port, () => {
  console.log(Servidor backend en http://localhost:${port});
});
 */
let carpetasComprobantes = {
  MP : './comprobantes/Mp/',
  BNA : './comprobantes/BNA/',  
  Santander : './comprobantes/Santander/', 
  CuentaDni : './comprobantes/CuentaDni/',
  BBVA : './comprobantes/BBVA/',
  BRUBANK : './comprobantes/BRUBANK/',
  GALICIA : './comprobantes/Galicia/', 
  Astropay : './comprobantes/AstroPay/',
  BancoCiudad : './comprobantes/BancoCiudad/',
  BancoDelSol : './comprobantes/BancoDelSol/',
  GaliciaMas : './comprobantes/GaliciaMas/',
  NaranjaX : './comprobantes/NaranjaX/',
  ICBC : './comprobantes/ICBC/',  
  Hipotecario : './comprobantes/Hipotecario/', 
   PersonalPay : './comprobantes/PersonalPay/',
  Provincia: './comprobantes/Provincia/',
  Supervielle: './comprobantes/Supervielle/',
   Uala : './comprobantes/Uala/',  
  
}

let allTransferData = [];

async function processFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const filePath = path.join(folderPath, file);
      console.log(`🔍 Procesando: ${filePath}`);

      try {
        const transferData = await extractTransferData(filePath, folderPath);
        const fileName = path.parse(file).name;
        generateXML(transferData, fileName);
        allTransferData.push(transferData);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
  }
}

async function processAllImages() {
  if (!fs.existsSync('comprobantes_xml')) fs.mkdirSync('comprobantes_xml');
  if (!fs.existsSync('comprobantes_csv')) fs.mkdirSync('comprobantes_csv');

  await Promise.all(Object.values(carpetasComprobantes).map(folder => processFolder(folder)));

  if (allTransferData.length > 0) {
    const csv = parse(allTransferData, { fields: Object.keys(allTransferData[0]) });
    fs.writeFileSync('comprobantes_csv/todos_comprobantes.csv', csv, 'utf-8');
    console.log('📂 CSV guardado: comprobantes_csv/todos_comprobantes.csv');
  }
}

processAllImages();
