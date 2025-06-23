/* document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    const form = new FormData(this); // Crear el objeto FormData con los datos del formulario

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: form
    })
    .then(response => {
        // Verificar si la respuesta es válida
        if (!response.ok) {
            throw new Error('Error al procesar los archivos');
        }
        return response.blob(); // Recibir el archivo CSV como un blob
    })
    .then(blob => {
        // Crear un enlace temporal para descargar el archivo CSV
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob); // Crear URL para el blob
        link.href = url;
        link.download = 'todos_comprobantes.csv'; // Nombre por defecto para el archivo CSV
        link.click(); // Simula un clic en el enlace para iniciar la descarga

        // Limpiar el URL temporal
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error al enviar los archivos:', error);
        alert('Error al enviar los archivos. Verifica la consola para más detalles.');
    });
});
 */
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    const form = new FormData(this); // Crear el objeto FormData con los datos del formulario

    // Mostrar el spinner
    const spinnerWrapper = document.getElementById('spinnerWrapper');
    spinnerWrapper.style.display = 'block';

    // Iniciar el proceso de subida
    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: form
    })
    .then(response => {
        // Verificar si la respuesta es válida
        if (!response.ok) {
            throw new Error('Error al procesar los archivos');
        }
        return response.blob(); // Recibir el archivo CSV como un blob
    })
    .then(blob => {
        // Crear un enlace temporal para descargar el archivo CSV
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob); // Crear URL para el blob
        link.href = url;
        let comprobanteName = `todos_comprobantes_${(new Date()).toISOString().split('T')[0].split('-').reverse().join('-')}.csv`;
        link.download = `${comprobanteName}`; // Nombre por defecto para el archivo CSV
        link.click(); // Simula un clic en el enlace para iniciar la descarga

        // Limpiar el URL temporal
        window.URL.revokeObjectURL(url);

        // Ocultar el spinner cuando se complete el proceso
        spinnerWrapper.style.display = 'none';
    })
    .catch(error => {
        console.error('Error al enviar los archivos:', error);
        alert('Error al enviar los archivos. Verifica la consola para más detalles.');

        // Ocultar el spinner si hay error
        spinnerWrapper.style.display = 'none';
    });
});
