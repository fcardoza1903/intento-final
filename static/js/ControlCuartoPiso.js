// Función para actualizar el estado de los sensores y LEDs del cuarto piso
function actualizarEstadoCuartoPiso() {
    // Obtener el estado de los sensores desde la API para ESP32_04
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getlateststatus?esp_id=ESP32_04')  // Incluye el esp_id específico en la URL
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los sensores: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Estado de los sensores del Cuarto Piso:", data); // Verificar estado en la consola

            // Actualizar Sensor de Proximidad (HC)
            const distancia = data.distancia || 0;
            document.getElementById('proximidad-status').innerText = distancia + ' cm';
            document.getElementById('proximidad-bar').style.width = `${distancia}%`;
            document.getElementById('proximidad-bar').innerText = `${distancia}%`;

            // Actualizar Sensor de Humedad
            const humedad = data.humedad || 0;
            document.getElementById('humedad-status').innerText = humedad + '%';
            document.getElementById('humedad-bar').style.width = `${humedad}%`;
            document.getElementById('humedad-bar').innerText = `${humedad}%`;

            // Actualizar Sensor PIR
            const movimiento = data.movimiento_detectado;
            if (movimiento) {
                document.getElementById('pir-status').innerText = 'Movimiento detectado';
                document.getElementById('pir-indicator').classList.remove('alert-info');
                document.getElementById('pir-indicator').classList.add('alert-success');
                document.getElementById('pir-indicator').innerText = '¡Movimiento detectado!';
            } else {
                document.getElementById('pir-status').innerText = 'No se detecta movimiento';
                document.getElementById('pir-indicator').classList.remove('alert-success');
                document.getElementById('pir-indicator').classList.add('alert-info');
                document.getElementById('pir-indicator').innerText = 'Esperando detección de movimiento...';
            }

            // Actualizar Sensor LDR
            const luz = data.luz || 0;
            const estadoLuz = luz > 50 ? 'Luz brillante' : 'Oscuridad detectada';
            document.getElementById('ldr-status').innerText = estadoLuz;
            document.getElementById('ldr-bar').style.width = `${luz}%`;
            document.getElementById('ldr-bar').innerText = `${luz}%`;
        })
        .catch(error => {
            console.error("Error al obtener el estado de los sensores del Cuarto Piso:", error);
            mostrarErrorSensores();
        });

    // Obtener el estado actual de los LEDs RGB desde la API
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getrgbstatus?esp_id=ESP32_04')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los LEDs RGB: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Estado de los LEDs RGB del Cuarto Piso:", data); // Verificar estado de los LEDs RGB en la consola

            actualizarEstadoLED('rgb1', data.led_rgb1_status, data.led_rgb1_color);
            actualizarEstadoLED('rgb2', data.led_rgb2_status, data.led_rgb2_color);
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs RGB del Cuarto Piso:", error);
            document.getElementById('rgb1-status').innerText = 'Error al cargar';
            document.getElementById('rgb2-status').innerText = 'Error al cargar';
        });
}

// Función para mostrar errores en los sensores si la carga falla
function mostrarErrorSensores() {
    document.getElementById('proximidad-status').innerText = 'Error al cargar';
    document.getElementById('humedad-status').innerText = 'Error al cargar';
    document.getElementById('pir-status').innerText = 'Error al cargar';
    document.getElementById('ldr-status').innerText = 'Error al cargar';

    document.getElementById('proximidad-bar').style.width = '0%';
    document.getElementById('humedad-bar').style.width = '0%';
    document.getElementById('ldr-bar').style.width = '0%';

    document.getElementById('pir-indicator').classList.remove('alert-success');
    document.getElementById('pir-indicator').classList.add('alert-danger');
    document.getElementById('pir-indicator').innerText = 'Error en el sensor PIR';
}

// Función para actualizar el estado de los LEDs RGB
function actualizarEstadoLED(ledId, estado, color) {
    const ledSwitch = document.getElementById(`${ledId}-switch`);
    const ledStatusLabel = document.getElementById(`${ledId}-status`);
    const colorPicker = document.getElementById(`${ledId}-color-picker`);

    if (estado) {
        ledSwitch.checked = true;
        ledStatusLabel.innerText = `LED ${ledId.toUpperCase()} encendido`;
        if (color) {
            colorPicker.value = color; // Asignar el color devuelto por la API
        }
    } else {
        ledSwitch.checked = false;
        ledStatusLabel.innerText = `LED ${ledId.toUpperCase()} apagado`;
    }
}

// Función para cambiar el estado de los LEDs RGB al encender o apagar
function toggleRGBLED(ledId) {
    const ledState = document.getElementById(`${ledId}-switch`).checked ? 1 : 0;
    const color = document.getElementById(`${ledId}-color-picker`).value;

    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/updatergb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            esp_id: "ESP32_04",
            [`${ledId}_status`]: ledState,
            [`${ledId}_color`]: color
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el estado del LED RGB ' + ledId.toUpperCase() + ': ' + response.status);
        }
        console.log(`Estado del LED RGB ${ledId.toUpperCase()} actualizado`);
        document.getElementById(`${ledId}-status`).innerText = ledState == 1 ? `LED ${ledId.toUpperCase()} encendido` : `LED ${ledId.toUpperCase()} apagado`;
    })
    .catch(error => {
        console.error(`Error al cambiar el estado del LED RGB ${ledId.toUpperCase()}:`, error);
        document.getElementById(`${ledId}-status`).innerText = `Error al actualizar el LED ${ledId.toUpperCase()}`;
    });
}

// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstadoCuartoPiso(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstadoCuartoPiso, 5000);

    // Escuchar el evento de cambio en los switches de los LEDs RGB
    document.getElementById('rgb1-switch').addEventListener('change', function() {
        toggleRGBLED('rgb1');
    });

    document.getElementById('rgb2-switch').addEventListener('change', function() {
        toggleRGBLED('rgb2');
    });

    // Manejar el cambio de color para los LEDs RGB
    document.getElementById('rgb1-color-picker').addEventListener('input', function() {
        toggleRGBLED('rgb1');
    });

    document.getElementById('rgb2-color-picker').addEventListener('input', function() {
        toggleRGBLED('rgb2');
    });
});
