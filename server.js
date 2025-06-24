//RENDER
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import processAllImages from './processAllImages.js';
import createRequiredFolders from './createRequiredFolders.js';


const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

createRequiredFolders();

// Carpeta para guardar los comprobantes
const folderComprobantes = './temp/todos/';
const comprobanteCSVFolder = './temp/comprobantes_csv/';

// Asegurarse de que la carpeta exista
if (!fs.existsSync(folderComprobantes)) {
  fs.mkdirSync(folderComprobantes, { recursive: true });
}

/* app.use(cors({
  origin: "http://localhost:3000"
})); */

const WHITELIST = [
  "http://localhost:3000",
  "https://pdf-converter-theta.vercel.app", // <--- Agregá tu dominio de Vercel
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || WHITELIST.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`❌ CORS bloqueado para: ${origin}`));
    }
  },
}));

// Función de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderComprobantes); // Guardar archivos en la carpeta 'comprobantes'
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`); // Renombrar archivo para evitar colisiones
  },
});

// Configuración de Multer
const upload = multer({ storage });

function limpiarCarpeta(carpeta) {
  if (fs.existsSync(carpeta)) {
    const archivos = fs.readdirSync(carpeta);
    for (const archivo of archivos) {
      const rutaCompleta = path.join(carpeta, archivo);
      const stat = fs.statSync(rutaCompleta);
      if (stat.isDirectory()) {
        limpiarCarpeta(rutaCompleta); // Recursividad para subcarpetas
      } else {
        fs.unlinkSync(rutaCompleta); // Eliminar archivo
      }
    }
  }
}

// Middleware para manejar el formulario y los archivos
app.post('/upload', upload.array('files', 200), async (req, res) => {
  try {
    // Obtener los archivos cargados
    const files = req.files.map(file => file.path);
    console.log('Archivos cargados:', files);

    await processAllImages();
    
    let comprobanteName = `todos_comprobantes_${(new Date()).toISOString().split('T')[0].split('-').reverse().join('-')}.csv`;

    const csvFilePath = `./temp/comprobantes_csv/${comprobanteName}`;
    if (!fs.existsSync(comprobanteCSVFolder)) {
      fs.mkdirSync(comprobanteCSVFolder, { recursive: true });
    }

    limpiarCarpeta('./temp/todos');
    const carpetaComprobantes = './temp/comprobantes';
    if (fs.existsSync(carpetaComprobantes)) {
      const subcarpetas = fs.readdirSync(carpetaComprobantes);
      for (const sub of subcarpetas) {
        const rutaSubcarpeta = path.join(carpetaComprobantes, sub);
        if (fs.statSync(rutaSubcarpeta).isDirectory()) {
          limpiarCarpeta(rutaSubcarpeta);
        }
      }
    }

    // Enviar el archivo CSV como respuesta para su descarga
    res.download(csvFilePath, `${comprobanteName}`, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
        res.status(500).send('Error al enviar el archivo');
      }
    });
  } catch (error) {
    console.error('Error procesando los archivos:', error);
    res.status(500).send('Error al procesar los archivos');
  }
});

// Servir el frontend estático
app.use(express.static('public'));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
