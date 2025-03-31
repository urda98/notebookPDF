let selectedBanco = ''; // Variable para almacenar el banco seleccionado

function setBanco(banco) {
    // Capturar el valor de data-banco al cambiar el archivo
    selectedBanco = banco;
}

// Manejar el envío del formulario con JavaScript
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el envío por defecto

    const form = new FormData(this); // Crear el objeto FormData con los datos del formulario
    
    if (!selectedBanco) {
        alert('Por favor, selecciona un banco antes de enviar.');
        return;
    }

    form.append('banco', selectedBanco);

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: form
    })
    .then(response => response.text())
    .then(data => {
        console.log('Respuesta del servidor:', data);
    })
    .catch(error => {
        console.error('Error al enviar los archivos:', error);
        alert('Error al enviar los archivos. Verifica la consola para más detalles.');
    });
});

