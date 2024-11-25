// Función para actualizar el estado de los sensores (nivel de agua, metal detectado, temperatura) y los LEDs
function actualizarEstado() {
    // Obtener el estado de los sensores desde la API para ESP32_02
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado del sensor: ' + response.status);
            } 
            return response.json();
        })
        .then(data => {
            console.log("Datos obtenidos de los sensores:", data); // Verificar datos en la consola

            // Actualizar estado del nivel de agua
            if (data.nivel_agua !== null && data.nivel_agua !== undefined) {
                const nivelAguaStatus = data.nivel_agua == 1 ? 'Nivel de agua alto' : 'Nivel de agua bajo';
                document.getElementById('nivel-agua-status').innerText = nivelAguaStatus;
            }

            // Actualizar estado del metal detectado
            if (data.metal_detectado !== null && data.metal_detectado !== undefined) {
                const metalStatus = data.metal_detectado == 1 ? 'Metal detectado' : 'No se detecta metal';
                document.getElementById('metal-status').innerText = metalStatus;
            }

            // Actualizar estado de la temperatura
            if (data.temperatura !== null && data.temperatura !== undefined) {
                const temperaturaStatus = `Temperatura: ${data.temperatura}°C`;
                document.getElementById('temperatura-status').innerText = temperaturaStatus;
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado del sensor:", error);
            document.getElementById('nivel-agua-status').innerText = 'Error al cargar';
            document.getElementById('metal-status').innerText = 'Error al cargar';
            document.getElementById('temperatura-status').innerText = 'Error al cargar';
        });

    // Obtener el estado actual de los LEDs clásicos desde la API
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getledstatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los LEDs clásicos: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Estado de los LEDs clásicos:", data); // Verificar estado de los LEDs en la consola

            if (data.led1_status !== null && data.led1_status !== undefined) {
                document.getElementById('led1-switch').checked = data.led1_status == 1;
                document.getElementById('led1-status').innerText = data.led1_status == 1 ? 'LED 1 encendido' : 'LED 1 apagado';
            }

            if (data.led2_status !== null && data.led2_status !== undefined) {
                document.getElementById('led2-switch').checked = data.led2_status == 1;
                document.getElementById('led2-status').innerText = data.led2_status == 1 ? 'LED 2 encendido' : 'LED 2 apagado';
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs clásicos:", error);
            document.getElementById('led1-status').innerText = 'Error al cargar';
            document.getElementById('led2-status').innerText = 'Error al cargar';
        });

    // Obtener el estado actual de los LEDs RGB desde la API
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/getrgbstatus?esp_id=ESP32_02')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el estado de los LEDs RGB: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Estado de los LEDs RGB:", data); // Verificar estado de los LEDs RGB en la consola

            // Actualizar estado del LED RGB 1 si está presente
            if (data.led_rgb1_status !== null && data.led_rgb1_status !== undefined) {
                document.getElementById('rgb1-switch').checked = data.led_rgb1_status == 1;
                document.getElementById('rgb1-status').innerText = data.led_rgb1_status == 1 ? 'RGB 1 encendido' : 'RGB 1 apagado';
                document.getElementById('rgb1-color-picker').value = data.led_rgb1_color || '#000000';
            }

            // Actualizar estado del LED RGB 2 si está presente
            if (data.led_rgb2_status !== null && data.led_rgb2_status !== undefined) {
                document.getElementById('rgb2-switch').checked = data.led_rgb2_status == 1;
                document.getElementById('rgb2-status').innerText = data.led_rgb2_status == 1 ? 'RGB 2 encendido' : 'RGB 2 apagado';
                document.getElementById('rgb2-color-picker').value = data.led_rgb2_color || '#000000';
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs RGB:", error);
            document.getElementById('rgb1-status').innerText = 'Error al cargar';
            document.getElementById('rgb2-status').innerText = 'Error al cargar';
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

// Función para cambiar el estado de los LEDs RGB cuando se activa el interruptor
function toggleRGB(ledNumber) {
    const rgbState = document.getElementById(`rgb${ledNumber}-switch`).checked ? 1 : 0;
    const rgbColor = document.getElementById(`rgb${ledNumber}-color-picker`).value;
    fetch('https://proyecto-iot-fiee.azurewebsites.net/api/updatergb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            esp_id: "ESP32_02",
            [`led_rgb${ledNumber}_status`]: rgbState,
            [`led_rgb${ledNumber}_color`]: rgbColor
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el estado del LED RGB ' + ledNumber + ': ' + response.status);
        }
        console.log(`Estado del LED RGB ${ledNumber} actualizado`);
        document.getElementById(`rgb${ledNumber}-status`).innerText = rgbState == 1 ? `RGB ${ledNumber} encendido` : `RGB ${ledNumber} apagado`;
    })
    .catch(error => {
        console.error(`Error al cambiar el estado del LED RGB ${ledNumber}:`, error);
        document.getElementById(`rgb${ledNumber}-status`).innerText = `Error al actualizar el LED RGB ${ledNumber}`;
    });
}

// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstado, 5000);

    // Escuchar el evento de cambio en el switch del LED 1 clásico
    document.getElementById('led1-switch').addEventListener('change', function() {
        toggleLED(1);  // Cambia el estado del LED clásico 1
    });

    // Escuchar el evento de cambio en el switch del LED 2 clásico
    document.getElementById('led2-switch').addEventListener('change', function() {
        toggleLED(2);  // Cambia el estado del LED clásico 2
    });

    // Escuchar el evento de cambio en el switch del LED RGB 1
    document.getElementById('rgb1-switch').addEventListener('change', function() {
        toggleRGB(1);  // Cambia el estado del LED RGB 1
    });

    // Escuchar el evento de cambio en el switch del LED RGB 2
    document.getElementById('rgb2-switch').addEventListener('change', function() {
        toggleRGB(2);  // Cambia el estado del LED RGB 2
    });

    // Manejar el cambio de color para los LEDs RGB
    document.getElementById('rgb1-color-picker').addEventListener('input', function() {
        toggleRGB(1);  // Actualiza el color del LED RGB 1
    });

    document.getElementById('rgb2-color-picker').addEventListener('input', function() {
        toggleRGB(2);  // Actualiza el color del LED RGB 2
    });
});
