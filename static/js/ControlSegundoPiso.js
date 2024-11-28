// Función para actualizar el estado de los sensores (nivel de agua, metal detectado, temperatura) y los LEDs
function actualizarEstado() {
     // Obtener el estado del PIR y LDR desde la API
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')  // Incluye el esp_id en la URL
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos:", data); // Verificar datos en la consola

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

     // Obtener el estado actual del LED desde la API
       fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_02') // Incluye el esp_id en la URL
        .then(response => response.json())
        .then(data => {
            console.log("Estado de los LEDs:", data); // Verificar estado de los LEDs en la consola

            // Actualizar cada LED individualmente
            actualizarEstado('led5', data.led5_status);
            actualizarEstado('led6', data.led6_status);
            actualizarEstado('led7', data.led7_status);
            actualizarEstado('led8', data.led8_status);
            actualizarEstado('led9', data.led9_status);
            actualizarEstado('led10', data.led10_status);
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);

            // Mostrar mensaje de error para cada LED
            ['led5', 'led6', 'led7', 'led8', 'led9','led10' ].forEach(ledId => {
                document.getElementById(${ledId}-status-text).innerText = 'Error al cargar';
            });
        });
}

// Función para cambiar el estado del LED cuando se activa el interruptor
function toggleLED(ledId) {
    const ledSwitch = document.getElementById(${ledId}-switch);
    const estado = ledSwitch.checked ? 1 : 0;

    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: esp_id=ESP32_02&${ledId}_status=${estado} // Asegúrate de incluir el esp_id y el LED correspondiente
    })
    .then(response => {
        if (response.ok) {
            console.log(Estado de ${ledId} actualizado);
            document.getElementById(${ledId}-status-text).innerText = estado == 1 ? 'Encendido' : 'Apagado';
        } else {
            console.error(Error al actualizar el estado de ${ledId});
        }
    })
    .catch(error => {
        console.error(Error al cambiar el estado de ${ledId}:, error);
        document.getElementById(${ledId}-status-text).innerText = 'Error al actualizar';
    });
}
// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstado, 5000);

    // Escuchar el evento de cambio en los switches de los LEDs
    ['led5', 'led6', 'led7', 'led8', 'led9', 'led10'].forEach(ledId => {
        document.getElementById(${ledId}-switch).addEventListener('change', function () {
            toggleLED(ledId); // Cambia el estado del LED correspondiente
        });
    });
});
