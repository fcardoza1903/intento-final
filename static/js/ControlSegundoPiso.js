// Función para actualizar el estado de los sensores (nivel de agua, metal detectado, temperatura) y los LEDs
function actualizarEstado() {
    // Obtener el estado de los sensores desde la API para ESP32_02
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')  // Incluye el esp_id en la URL
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos:", data); // Verificar datos en la consola

            // Actualizar estado del PIR
            const pir1Status = data.pir1_status ? 'Movimiento detectado' : 'No se detecta movimiento';
            document.getElementById('pir1-status').innerText = pir1Status;

            // Actualizar estado del LDR
            const ldr1Status = data.ldr1_status ? 'Luz detectada' : 'Sin luz detectada';
            document.getElementById('ldr1-status').innerText = ldr1Status;
        })
        .catch(error => {
            console.error("Error al obtener el estado de los sensores:", error);
            document.getElementById('pir1-status').innerText = 'Error al cargar';
            document.getElementById('ldr1-status').innerText = 'Error al cargar';
        });

    // Obtener el estado actual de los LEDs desde la API
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_02')  // Incluye el esp_id en la URL
        .then(response => response.json())
        .then(data => {
            console.log("Estado de los LEDs:", data); // Verificar estado de los LEDs en la consola
            document.getElementById('led5-switch').checked = data.led5_status;
            document.getElementById('led5-status-text').innerText = data.led5_status ? 'LED 5 encendido' : 'LED 5 apagado';

            document.getElementById('led6-switch').checked = data.led6_status;
            document.getElementById('led6-status-text').innerText = data.led6_status ? 'LED 6 encendido' : 'LED 6 apagado';

            document.getElementById('led7-switch').checked = data.led7_status;
            document.getElementById('led7-status-text').innerText = data.led7_status ? 'LED 7 encendido' : 'LED 7 apagado';

            document.getElementById('led8-switch').checked = data.led8_status;
            document.getElementById('led8-status-text').innerText = data.led8_status ? 'LED 8 encendido' : 'LED 8 apagado';
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);
            document.getElementById('led5-status-text').innerText = 'Error al cargar';
            document.getElementById('led6-status-text').innerText = 'Error al cargar';
            document.getElementById('led7-status-text').innerText = 'Error al cargar';
            document.getElementById('led8-status-text').innerText = 'Error al cargar';
        });
}

// Función para cambiar el estado de los LEDs cuando se activa el interruptor
function toggleLED(ledNumber) {
    const ledState = document.getElementById(`led${ledNumber}-switch`).checked;  // true o false
    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `esp_id=ESP32_02&led${ledNumber}_status=${ledState}`  // Asegúrate de incluir el esp_id y el led que se va a actualizar
    })
    .then(response => {
        if (response.ok) {
            console.log(`Estado del LED ${ledNumber} actualizado`);
            document.getElementById(`led${ledNumber}-status-text`).innerText = ledState ? `LED ${ledNumber} encendido` : `LED ${ledNumber} apagado`;
        } else {
            console.error(`Error al actualizar el estado del LED ${ledNumber}`);
        }
    })
    .catch(error => {
        console.error(`Error al cambiar el estado del LED ${ledNumber}:`, error);
        document.getElementById(`led${ledNumber}-status-text`).innerText = `Error al actualizar el LED ${ledNumber}`;
    });
}

// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstado, 5000);

    // Escuchar el evento de cambio en los interruptores de los LEDs
    for (let i = 5; i <= 8; i++) {
        document.getElementById(`led${i}-switch`).addEventListener('change', function() {
            toggleLED(i);  // Cambia el estado del LED
        });
    }
});
