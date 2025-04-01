import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import processAllImages from './processAllImages.js';


const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpeta para guardar los comprobantes
const folderComprobantes = './todos/';

// Asegurarse de que la carpeta exista
if (!fs.existsSync(folderComprobantes)) {
  fs.mkdirSync(folderComprobantes, { recursive: true });
}

app.use(cors({
  origin: "http://localhost:3000"
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

// Middleware para manejar el formulario y los archivos
app.post('/upload', upload.array('files', 200), async (req, res) => {
  try {
    // Obtener los archivos cargados
    const files = req.files.map(file => file.path);
    console.log('Archivos cargados:', files);

    processAllImages(files);
    
    const csvFilePath = './comprobantes_csv/todos_comprobantes.csv';
    // Enviar el archivo CSV como respuesta para su descarga
    res.download(csvFilePath, 'todos_comprobantes.csv', (err) => {
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
