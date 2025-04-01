document.getElementById('uploadForm').addEventListener('submit', function(event) {
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
