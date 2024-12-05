// Función para actualizar el estado de los sensores (nivel de agua, metal detectado, temperatura) y los LEDs
function actualizarEstado() {
    // Obtener estado de los sensores
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos de los sensores:", data);

            // Actualizar estado del nivel de agua
            const pirStatus = data.pir_status === true ? "MOVIMIENTO DETECTADO" : "MOVIMIENTO NO DETECTADO";
            document.getElementById('pir-status').innerText = pirStatus || "Dato no disponible";

            // Actualizar estado del LDR (detector de luz)
            const ldrStatus = data.ldr_status === true ? "NO LUZ" : "LUZ";
            document.getElementById('ldr-status').innerText = ldrStatus || "SIN INFORMACION";

            // Actualizar estado del metal detectado
            const metalDetectado = data.metal_detectado === true ? "PRESENCIA EN ENTRADA PRINCIOAK" : "ENTRADA PRINCIPAL LIBRE";
            document.getElementById('metal-status').innerText = metalDetectado || "Dato no disponible";

            // Actualizar temperatura
            const temperatura = data.temperatura !== undefined ? `${data.temperatura} °C` : "SIN INFORMACION DE TEMPERATURA";
            document.getElementById('temperatura-status').innerText = temperatura || "Dato no disponible";

            // Actualizar estado del nivel de agua
            const nivelAgua = data.nivel_agua !== undefined ? `${data.nivel_agua} m` : "Dato no disponible";
            document.getElementById('nivel-agua-status').innerText = nivelAgua || "Dato no disponible";
        })
        .catch(error => {
            console.error("Error al obtener el estado del sensor:", error);
            document.getElementById('pir-status').innerText = 'Error al cargar';
            document.getElementById('ldr-status').innerText = 'Error al cargar';
            document.getElementById('metal-status').innerText = 'Error al cargar';
            document.getElementById('temperatura-status').innerText = 'Error al cargar';
            document.getElementById('nivel-agua-status').innerText = 'Error al cargar';
        });

    // Obtener estado de los LEDs
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            console.log("Estado de los LEDs:", data);

            // Actualizar estado de los LEDs de forma dinámica
            for (let i = 1; i <= 4; i++) {
                const ledStatus = data[`led${i}_status`] === true;
                document.getElementById(`led${i}-switch`).checked = ledStatus;
                document.getElementById(`led${i}-status-text`).innerText = ledStatus ? `LED ${i} encendido` : `LED ${i} apagado`;
            }
            
            // Actualizar LED 10
            const led10Status = data.led10_status === true;
            document.getElementById('led10-switch').checked = led10Status;
            document.getElementById('led10-status-text').innerText = led10Status ? "LED 10 encendido" : "LED 10 apagado";
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);
            for (let i = 1; i <= 4; i++) {
                document.getElementById(`led${i}-status-text`).innerText = 'Error al cargar';
            }
            document.getElementById('led10-status-text').innerText = 'Error al cargar';
        });
}

// Función para cambiar el estado de un LED
function toggleLED(ledNumber) {
    const ledState = document.getElementById(`led${ledNumber}-switch`).checked;
    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            esp_id: "ESP32_01",
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
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`led${i}-switch`).addEventListener('change', function () {
            toggleLED(i);
        });
    }

    // Configurar evento para LED 10
    document.getElementById('led10-switch').addEventListener('change', function () {
        toggleLED(10);
    });
});
