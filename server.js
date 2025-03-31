import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import processAllImages from './processAllImages.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpetas donde se guardarán los archivos según el banco
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
    Uala2 : './comprobantes/Uala2/', 
    Uala : './comprobantes/Uala/',
    Marco :  './comprobantes/Macro/',
    Lemon : './comprobantes/Lemon/'
     
    
  }

app.use(cors());

// Función de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Obtener el valor del banco a partir del atributo data-banco
    const banco = req.body.banco;
    console.log('Banco seleccionado:', banco);
    const folder = carpetasComprobantes[banco] || carpetasComprobantes['Otros']; // Asignar la carpeta correspondiente
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder); // Guardar archivo en la carpeta correspondiente
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`); // Renombrar el archivo para evitar colisiones
  },
});

// Configuración de Multer
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Middleware para manejar el formulario y los archivos
app.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    // Procesar archivos cargados
    const files = req.files.map(file => file.path);
    console.log('Archivos cargados:', files);
    

    await processAllImages();

    res.send('Archivos procesados correctamente');
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
