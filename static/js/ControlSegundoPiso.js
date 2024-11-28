// Función para actualizar el estado de los sensores (nivel de agua, metal detectado, temperatura) y los LEDs
function actualizarEstado() {
    // Obtener el estado de los sensores desde la API para ESP32_02
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado del sensor: ' + response.status);
            } 
            return response.json();
        })
        .then(data => {
            console.log("Datos obtenidos de los sensores:", data); // Verificar datos en la consola

            // Actualizar estado del nivel de agua
            if (data.pir1_status !== null && data.pir1_status !== undefined) {
                const nivelAguaStatus = data.pir1_status == 1 ? 'MOVIMIENTO' : 'NO MOVIMIENTO';
                document.getElementById('pir1-status').innerText = pir1Status;
            }

            // Actualizar estado del metal detectado
            if (data.ldr1_status !== null && data.ldr1_status !== undefined) {
                const metalStatus = data.ldr1_status == 1 ? 'LUZ' : 'NO LUZ';
                document.getElementById('ldr1-status').innerText = ldr1Status;
            }

        })
        .catch(error => {
            console.error("Error al obtener el estado del sensor:", error);
            document.getElementById('pir1-status').innerText = 'Error al cargar';
            document.getElementById('ldr1-status').innerText = 'Error al cargar';
        });

    // Obtener el estado actual de los LEDs clásicos desde la API
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los LEDs: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Estado de los LEDs:", data); // Verificar estado de los LEDs en la consola

            if (data.led5_status !== null && data.led5_status !== undefined) {
                document.getElementById('led5-switch').checked = data.led5_status == 1;
                document.getElementById('led5-status-text').innerText = data.led5_status == 1 ? 'LED 5 encendido' : 'LED 5 apagado';
            }

            if (data.led6_status !== null && data.led6_status !== undefined) {
                document.getElementById('led6-switch').checked = data.led6_status == 1;
                document.getElementById('led6-status-text').innerText = data.led6_status == 1 ? 'LED 6 encendido' : 'LED 6 apagado';
            }

            if (data.led7_status !== null && data.led7_status !== undefined) {
                document.getElementById('led7-switch').checked = data.led7_status == 1;
                document.getElementById('led7-status-text').innerText = data.led7_status == 1 ? 'LED 7 encendido' : 'LED 7 apagado';
            }

            if (data.led8_status !== null && data.led8_status !== undefined) {
                document.getElementById('led8-switch').checked = data.led8_status == 1;
                document.getElementById('led8-status-text').innerText = data.led8_status == 1 ? 'LED 8 encendido' : 'LED 8 apagado';
            }

            if (data.led9_status !== null && data.led9_status !== undefined) {
                document.getElementById('led9-switch').checked = data.led9_status == 1;
                document.getElementById('led9-status-text').innerText = data.led9_status == 1 ? 'LED 9 encendido' : 'LED 9 apagado';
            }

            if (data.led10_status !== null && data.led10_status !== undefined) {
                document.getElementById('led10-switch').checked = data.led10_status == 1;
                document.getElementById('led10-status-text').innerText = data.led6_status == 1 ? 'LED 10 encendido' : 'LED 10 apagado';
            }

    
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);
            document.getElementById('led5-status-text').innerText = 'Error al cargar';
            document.getElementById('led6-status-text').innerText = 'Error al cargar';
            document.getElementById('led7-status-text').innerText = 'Error al cargar';
            document.getElementById('led8-status-text').innerText = 'Error al cargar';
            document.getElementById('led9-status-text').innerText = 'Error al cargar';
            document.getElementById('led10-status-text').innerText = 'Error al cargar';
        });

}

// Función para cambiar el estado de los LEDs clásicos cuando se activa el interruptor
function toggleLED(ledNumber) {
    const ledState = document.getElementById(`led${ledNumber}-switch`).checked ? 1 : 0;
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            esp_id: "ESP32_02",
            [`led${ledNumber}_status`]: ledState
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el estado del LED clásico ' + ledNumber + ': ' + response.status);
        }
        console.log(`Estado del LED clásico ${ledNumber} actualizado`);
        document.getElementById(`led${ledNumber}-status`).innerText = ledState == 1 ? `LED ${ledNumber} encendido` : `LED ${ledNumber} apagado`;
    })
    .catch(error => {
        console.error(`Error al cambiar el estado del LED clásico ${ledNumber}:`, error);
        document.getElementById(`led${ledNumber}-status`).innerText = `Error al actualizar el LED ${ledNumber}`;
    });
}


// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstado, 5000);

    // Escuchar el evento de cambio en el switch del LED 1 clásico
    document.getElementById('led1-switch').addEventListener('change', function() {
        toggleLED(5);  // Cambia el estado del LED clásico 1
    });

    // Escuchar el evento de cambio en el switch del LED 2 clásico
    document.getElementById('led2-switch').addEventListener('change', function() {
        toggleLED(6);  // Cambia el estado del LED clásico 2
    });

 // Escuchar el evento de cambio en el switch del LED 2 clásico
    document.getElementById('led2-switch').addEventListener('change', function() {
        toggleLED(7);  // Cambia el estado del LED clásico 2
    });

     // Escuchar el evento de cambio en el switch del LED 2 clásico
    document.getElementById('led2-switch').addEventListener('change', function() {
        toggleLED(8);  // Cambia el estado del LED clásico 2
    });

     // Escuchar el evento de cambio en el switch del LED 2 clásico
    document.getElementById('led2-switch').addEventListener('change', function() {
        toggleLED(9);  // Cambia el estado del LED clásico 2
    });

     // Escuchar el evento de cambio en el switch del LED 2 clásico
    document.getElementById('led2-switch').addEventListener('change', function() {
        toggleLED(10);  // Cambia el estado del LED clásico 2
    });

});
