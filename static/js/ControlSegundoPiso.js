// Función para actualizar el estado de los sensores (PIR y LDR)
function actualizarSensores() {
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02') // Sensores
        .then(response => response.json())
        .then(data => {
            console.log("Datos de sensores obtenidos:", data);

            // Actualizar estado del PIR
            const pir1Status = data.pir1_status == 1 ? 'Movimiento detectado' : 'No se detecta movimiento';
            document.getElementById('pir1-status').innerText = pir1Status;
            document.getElementById('pir1-status').style.backgroundColor = data.pir1_status == 1 ? 'green' : 'gray';

            // Actualizar estado del LDR
            const ldr1Status = data.ldr1_status == 1 ? 'Luz detectada' : 'Oscuridad detectada';
            document.getElementById('ldr1-status').innerText = ldr1Status;
            document.getElementById('ldr1-status').style.backgroundColor = data.ldr1_status == 1 ? 'yellow' : 'gray';
        })
        .catch(error => {
            console.error("Error al obtener el estado del sensor:", error);
            document.getElementById('pir1-status').innerText = 'Error al cargar';
            document.getElementById('ldr1-status').innerText = 'Error al cargar';
        });
}

// Función para cambiar el estado del LED cuando se activa el interruptor
function toggleLED(ledId) {
    const ledSwitch = document.getElementById(`${ledId}-switch`);
    const estado = ledSwitch.checked ? 1 : 0;

    // Realizar solicitud al servidor solo al interactuar
    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `esp_id=ESP32_02&${ledId}_status=${estado}` // Asegúrate de incluir el esp_id y el LED correspondiente
    })
    .then(response => {
        if (response.ok) {
            console.log(`Estado de ${ledId} actualizado`);
            document.getElementById(`${ledId}-status-text`).innerText = estado == 1 ? 'Encendido' : 'Apagado';
        } else {
            console.error(`Error al actualizar el estado de ${ledId}`);
        }
    })
    .catch(error => {
        console.error(`Error al cambiar el estado de ${ledId}:`, error);
        document.getElementById(`${ledId}-status-text`).innerText = 'Error al actualizar';
    });
}

// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarSensores(); // Actualizar estado de los sensores inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado de los sensores cada 5 segundos
    setInterval(actualizarSensores, 5000);

    // Escuchar el evento de cambio en los switches de los LEDs
    ['led5', 'led6', 'led7', 'led8', 'led9', 'led10'].forEach(ledId => {
        document.getElementById(`${ledId}-switch`).addEventListener('change', function () {
            toggleLED(ledId); // Cambia el estado del LED correspondiente
        });
    });
});
