import { fromPath } from "pdf2pic";
import path from 'path';  // Importa la función desde pdf2pic

// Función para convertir PDF a PNG
async function convertPdfToPng(filePath, folderPath) {
  try {
    // Configura la conversión
    const pdf2pic = fromPath(filePath, {
      density: 100, // Resolución de la imagen
      saveFilename: path.parse(filePath).name, // Nombre del archivo (sin extensión)
      savePath: folderPath, // Directorio donde se guardará la imagen
      format: "png", // Formato de salida
      width: 1024, // Ancho de la imagen
      height: 1024 // Alto de la imagen
    });

    // Realiza la conversión
    const image = await pdf2pic.convert(1); // Convierte la primera página (puedes cambiar el número si deseas convertir más páginas)
    return image[0].path; // Devuelve la ruta de la imagen convertida
  } catch (error) {
    console.error("Error al convertir PDF a PNG:", error);
    return null; // En caso de error, devuelve null
  }
}

// Exportar para usar en otro archivo si es necesario
export default  convertPdfToPng ;
