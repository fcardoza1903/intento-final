// Función para actualizar el estado de los sensores (nivel de agua, metal detectado) y los LEDs
async function actualizarEstado() {
    try {
        // Obtener estado de los sensores
        const sensoresResponse = await fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02');
        if (!sensoresResponse.ok) throw new Error(`Error al obtener estado de los sensores: ${sensoresResponse.status}`);
        
        const sensoresData = await sensoresResponse.json();
        console.log("Datos obtenidos de los sensores:", sensoresData);
        
        // Actualizar estado del nivel de agua
        const pir1Status = sensoresData.pir1_status === 1 ? 'MOVIMIENTO' : 'NO MOVIMIENTO';
        document.getElementById('pir1-status').innerText = pir1Status || 'Dato no disponible';

        // Actualizar estado del metal detectado
        const ldr1Status = sensoresData.ldr1_status === 1 ? 'LUZ' : 'NO LUZ';
        document.getElementById('ldr1-status').innerText = ldr1Status || 'Dato no disponible';

    } catch (error) {
        console.error("Error al obtener el estado del sensor:", error);
        document.getElementById('pir1-status').innerText = 'Error al cargar';
        document.getElementById('ldr1-status').innerText = 'Error al cargar';
    }

    try {
        // Obtener estado de los LEDs
        const ledsResponse = await fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_02');
        if (!ledsResponse.ok) throw new Error(`Error al obtener estado de los LEDs: ${ledsResponse.status}`);
        
        const ledsData = await ledsResponse.json();
        console.log("Estado de los LEDs:", ledsData);

        // Actualizar estado de los LEDs de forma dinámica
        for (let i = 5; i <= 10; i++) {
            const ledStatus = ledsData[`led${i}_status`] === 1;
            document.getElementById(`led${i}-switch`).checked = ledStatus;
            document.getElementById(`led${i}-status-text`).innerText = ledStatus ? `LED ${i} encendido` : `LED ${i} apagado`;
        }
    } catch (error) {
        console.error("Error al obtener el estado de los LEDs:", error);
        for (let i = 5; i <= 10; i++) {
            document.getElementById(`led${i}-status-text`).innerText = 'Error al cargar';
        }
    }
}
// Función para cambiar el estado de un LED
async function toggleLED(ledNumber) {
    const ledSwitch = document.getElementById(`led${ledNumber}-switch`);
    const ledState = ledSwitch.checked ? 1 : 0;

    // Bloquea el switch mientras se actualiza
    ledSwitch.disabled = true;

    try {
        const response = await fetch('https://intento-final.azurewebsites.net/api/updateled', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                esp_id: "ESP32_02",
                [`led${ledNumber}_status`]: ledState
            })
        });

        if (!response.ok) throw new Error(`Error al actualizar LED ${ledNumber}: ${response.status}`);

        console.log(`Estado del LED ${ledNumber} actualizado`);
        document.getElementById(`led${ledNumber}-status-text`).innerText = ledState ? `LED ${ledNumber} encendido` : `LED ${ledNumber} apagado`;

        // Rehabilitar el switch y mantener el estado actualizado
        ledSwitch.disabled = false;
    } catch (error) {
        console.error(`Error al cambiar el estado del LED ${ledNumber}:`, error);
        document.getElementById(`led${ledNumber}-status-text`).innerText = `Error al actualizar el LED ${ledNumber}`;

        // Revertir el cambio en el switch si falla
        ledSwitch.checked = !ledState;
        ledSwitch.disabled = false;
    }
}


// Configuración de eventos y actualización inicial al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado al cargar la página
    setInterval(actualizarEstado, 5000); // Actualizar cada 5 segundos

    // Configurar eventos de los switches de LEDs
    for (let i = 5; i <= 10; i++) {
        document.getElementById(`led${i}-switch`).addEventListener('change', function () {
            toggleLED(i);
        });
    }
});
