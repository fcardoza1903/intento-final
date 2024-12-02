// Función para actualizar el estado de los sensores y los LEDs
function actualizarEstado() {
    // Obtener el estado de los sensores desde la API
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos:", data);

            // Actualizar estado del PIR
            const pirStatus = data.pir_status === true ? 'Movimiento detectado' : 'No se detecta movimiento';
            actualizarSensorEstado('pir-status', pirStatus, data.pir_status === true ? 'green' : 'gray');

            // Actualizar estado del LDR
            const ldrStatus = data.ldr_status === true ? 'Luz detectada' : 'Oscuridad detectada';
            actualizarSensorEstado('ldr-status', ldrStatus, data.ldr_status === true ? 'yellow' : 'gray');

            // Actualizar estado del sensor de metal
            const metalStatus = data.metal_detectado === true ? 'Metal detectado' : 'No se detecta metal';
            actualizarSensorEstado('metal-status', metalStatus, data.metal_detectado === true ? 'orange' : 'gray');

            // Actualizar estado del sensor de temperatura
            const tempStatus = `Temperatura: ${data.temperatura || 'Cargando...'} °C`;
            actualizarSensorEstado('temp-status', tempStatus, 'lightblue');
        })
        .catch(error => {
            console.error("Error al obtener el estado de los sensores:", error);
            mostrarErrorSensores(['pir-status', 'ldr-status', 'metal-status', 'temp-status']);
        });

    // Obtener el estado actual de los LEDs desde la API
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            console.log("Estado de los LEDs:", data);

            // Actualizar cada LED
            ['led1', 'led2', 'led3', 'led4', 'led11'].forEach(ledId => {
                actualizarLEDStatus(ledId, data[`${ledId}_status`]);
            });
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);
            mostrarErrorLEDs(['led1', 'led2', 'led3', 'led4', 'led11']);
        });
}

// Función para actualizar el estado de un sensor
function actualizarSensorEstado(sensorId, statusText, backgroundColor) {
    const sensorElement = document.getElementById(sensorId);
    sensorElement.innerText = statusText;
    sensorElement.style.backgroundColor = backgroundColor;
}

// Función para mostrar error en los sensores
function mostrarErrorSensores(sensorIds) {
    sensorIds.forEach(sensorId => {
        const sensorElement = document.getElementById(sensorId);
        sensorElement.innerText = 'Error al cargar';
        sensorElement.style.backgroundColor = 'red';
    });
}

// Función para actualizar el estado de un LED
function actualizarLEDStatus(ledId, status) {
    const ledSwitch = document.getElementById(`${ledId}-switch`);
    const ledStatusText = document.getElementById(`${ledId}-status-text`);
    ledSwitch.checked = status === true;
    ledStatusText.innerText = status === true ? 'Encendido' : 'Apagado';
}

// Función para mostrar error en los LEDs
function mostrarErrorLEDs(ledIds) {
    ledIds.forEach(ledId => {
        const ledStatusText = document.getElementById(`${ledId}-status-text`);
        ledStatusText.innerText = 'Error al cargar';
    });
}

// Función para cambiar el estado de un LED cuando se activa el interruptor
function toggleLED(ledId) {
    const ledSwitch = document.getElementById(`${ledId}-switch`);
    const estado = ledSwitch.checked ? 1 : 0;

    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `esp_id=ESP32_01&${ledId}_status=${estado}`
    })
        .then(response => {
            if (response.ok) {
                console.log(`Estado de ${ledId} actualizado`);
                document.getElementById(`${ledId}-status-text`).innerText = estado === true ? 'Encendido' : 'Apagado';
            } else {
                console.error(`Error al actualizar el estado de ${ledId}`);
            }
        })
        .catch(error => {
            console.error(`Error al cambiar el estado de ${ledId}:`, error);
            document.getElementById(`${ledId}-status-text`).innerText = 'Error al actualizar';
        });
}

// Configuración inicial
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado();
    setInterval(actualizarEstado, 5000);

    ['led1', 'led2', 'led3', 'led4', 'led11'].forEach(ledId => {
        document.getElementById(`${ledId}-switch`).addEventListener('change', function () {
            toggleLED(ledId);
        });
    });
});
