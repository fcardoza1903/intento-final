// Función para actualizar el estado de los sensores (nivel de agua, metal detectado) y los LEDs
function actualizarEstado() {
    // Obtener estado de los sensores
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos de los sensores:", data);

            // Actualizar estado del nivel de agua
            const pir1Status = data.pir1_status === true ? "MOVIMIENTO" : "NO MOVIMIENTO";
            document.getElementById('pir1-status').innerText = pir1Status || "Dato no disponible";

            // Actualizar estado del metal detectado
            const ldr1Status = data.ldr1_status === true ? "NO LUZ" : "LUZ";
            document.getElementById('ldr1-status').innerText = ldr1Status || "Dato no disponible";
        })
        .catch(error => {
            console.error("Error al obtener el estado del sensor:", error);
            document.getElementById('pir1-status').innerText = 'Error al cargar';
            document.getElementById('ldr1-status').innerText = 'Error al cargar';
        });

    // Obtener estado de los LEDs
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_02')
        .then(response => response.json())
        .then(data => {
            console.log("Estado de los LEDs:", data);

            // Actualizar estado de los LEDs de forma dinámica
            for (let i = 5; i <= 10; i++) {
                const ledStatus = data[`led${i}_status`] === true;
                document.getElementById(`led${i}-switch`).checked = ledStatus;
                document.getElementById(`led${i}-status-text`).innerText = ledStatus ? `LED ${i} encendido` : `LED ${i} apagado`;
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);
            for (let i = 5; i <= 10; i++) {
                document.getElementById(`led${i}-status-text`).innerText = 'Error al cargar';
            }
        });
}

// Función para cambiar el estado de un LED
function toggleLED(ledNumber) {
    const ledState = document.getElementById(`led${ledNumber}-switch`).checked;
    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            esp_id: "ESP32_02",
            [`led${ledNumber}_status`]: ledState
        })
    })
    .then(response => {
        if (response.ok) {
            console.log(`Estado del LED ${ledNumber} actualizado`);
            document.getElementById(`led${ledNumber}-status-text`).innerText = ledState ? `LED ${ledNumber} encendido` : `LED ${ledNumber} apagado`;
        } else {
            response.text().then(errorText => {
                console.error(`Error al actualizar el estado del LED ${ledNumber}: ${errorText}`);
            });
        }
    })
    .catch(error => {
        console.error(`Error al cambiar el estado del LED ${ledNumber}:`, error);
        document.getElementById(`led${ledNumber}-status-text`).innerText = `Error al actualizar el LED ${ledNumber}`;
    });
}

// Configuración de eventos y actualización inicial al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado al cargar la página
    setInterval(actualizarEstado, 500); // Actualizar cada 5 segundos

    // Configurar eventos de los switches de LEDs
    for (let i = 5; i <= 10; i++) {
        document.getElementById(`led${i}-switch`).addEventListener('change', function () {
            toggleLED(i);
        });
    }
});
