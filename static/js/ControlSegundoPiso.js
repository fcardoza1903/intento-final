// Función para actualizar el estado de los sensores (PIR1 y LDR1) y los LEDs
function actualizarEstado() {
    // Obtener el estado de los sensores PIR1 y LDR1 desde la API para ESP32_02
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado del sensor: ' + response.status);
            } 
            return response.json();
        })
        .then(data => {
            console.log("Datos obtenidos de los sensores PIR1 y LDR1:", data); // Verificar datos en la consola

            // Actualizar estado del sensor PIR1
            if (data.pir1 !== null && data.pir1 !== undefined) {
                const pir1Status = data.pir1 == 1 ? 'PIR1 activado' : 'PIR1 desactivado';
                document.getElementById('pir1-status').innerText = pir1Status;
            }

            // Actualizar estado del sensor LDR1
            if (data.ldr1 !== null && data.ldr1 !== undefined) {
                const ldr1Status = data.ldr1 == 1 ? 'LDR1 detectando luz' : 'LDR1 sin luz';
                document.getElementById('ldr1-status').innerText = ldr1Status;
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de los sensores PIR1 y LDR1:", error);
            document.getElementById('pir1-status').innerText = 'Error al cargar';
            document.getElementById('ldr1-status').innerText = 'Error al cargar';
        });

    // Obtener el estado actual de los LEDs 5, 6, 7, 8, 9 y 10 desde la API
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getledstatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los LEDs: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Estado de los LEDs:", data); // Verificar estado de los LEDs en la consola

            // Actualizar estado de los LEDs 5 a 10
            for (let i = 5; i <= 10; i++) {
                if (data[`led${i}_status`] !== null && data[`led${i}_status`] !== undefined) {
                    document.getElementById(`led${i}-switch`).checked = data[`led${i}_status`] == 1;
                    document.getElementById(`led${i}-status`).innerText = data[`led${i}_status`] == 1 ? `LED ${i} encendido` : `LED ${i} apagado`;
                }
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);
            for (let i = 5; i <= 10; i++) {
                document.getElementById(`led${i}-status`).innerText = 'Error al cargar';
            }
        });
}

// Función para cambiar el estado de los LEDs cuando se activa el interruptor
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
            throw new Error('Error al actualizar el estado del LED ' + ledNumber + ': ' + response.status);
        }
        console.log(`Estado del LED ${ledNumber} actualizado`);
        document.getElementById(`led${ledNumber}-status`).innerText = ledState == 1 ? `LED ${ledNumber} encendido` : `LED ${ledNumber} apagado`;
    })
    .catch(error => {
        console.error(`Error al cambiar el estado del LED ${ledNumber}:`, error);
        document.getElementById(`led${ledNumber}-status`).innerText = `Error al actualizar el LED ${ledNumber}`;
    });
}

// Función para manejar el encendido de los LEDs cuando se activa PIR1 y LDR1
function verificarSensoresYEncenderLEDs() {
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los sensores PIR1 y LDR1: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Verificar si PIR1 y LDR1 están activados
            if (data.pir1 === 1 && data.ldr1 === 1) {
                // Enciende los LEDs 5 y 6 si ambos sensores están activados
                toggleLED(5); // Encender LED 5
                toggleLED(6); // Encender LED 6
            }
        })
        .catch(error => {
            console.error("Error al verificar los sensores PIR1 y LDR1:", error);
        });
}

// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstado, 5000);

    // Establecer un intervalo para verificar PIR1 y LDR1 cada 5 segundos
    setInterval(verificarSensoresYEncenderLEDs, 5000);

    // Escuchar el evento de cambio en los interruptores de los LEDs 5 a 10
    for (let i = 5; i <= 10; i++) {
        document.getElementById(`led${i}-switch`).addEventListener('change', function() {
            toggleLED(i);  // Cambia el estado del LED
        });
    }
});
