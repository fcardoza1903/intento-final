// Función para actualizar el estado de los sensores (PIR y LDR) y el LED
function actualizarEstado() {
    // Obtener el estado del PIR y LDR desde la API
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_01')  // Incluye el esp_id en la URL
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos:", data); // Verificar datos en la consola

            // Actualizar estado del PIR
            const pirStatus = data.pir_status == 1 ? 'Movimiento detectado' : 'No se detecta movimiento';
            document.getElementById('pir-status').innerText = pirStatus;
            document.getElementById('pir-status').style.backgroundColor = data.pir_status == 1 ? 'green' : 'gray';

            // Actualizar estado del LDR
            const ldrStatus = data.ldr_status == 1 ? 'Luz detectada' : 'Oscuridad detectada';
            document.getElementById('ldr-status').innerText = ldrStatus;
            document.getElementById('ldr-status').style.backgroundColor = data.ldr_status == 1 ? 'yellow' : 'gray';
           
            // Actualizar estado del sensor de metal
            const metalStatus = data.metal_detectado == 1 ? 'Metal detectado' : 'No se detecta metal';
            document.getElementById('metal-status').innerText = metalStatus;
            document.getElementById('metal-status').style.backgroundColor = data.metal_detectado == 1 ? 'orange' : 'gray';
            
            // Actualizar estado del sensor de nivel de agua
            const nivelAguaStatus = data.nivel_agua == 1 ? 'Agua detectada' : 'El jardin necesita agua';
            document.getElementById('water-status').innerText = nivelAguaStatus;
            document.getElementById('water-status').style.backgroundColor = data.nivel_agua == 1 ? 'blue' : 'gray';        
        })
        .catch(error => {
            console.error("Error al obtener el estado del sensor:", error);
            document.getElementById('pir-status').innerText = 'Error al cargar';
            document.getElementById('ldr-status').innerText = 'Error al cargar';
            document.getElementById('metal-status').innerText = 'Error al cargar';
            document.getElementById('water-status').innerText = 'Error al cargar';
        });

    // Obtener el estado actual del LED desde la API
       fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_01') // Incluye el esp_id en la URL
        .then(response => response.json())
        .then(data => {
            console.log("Estado de los LEDs:", data); // Verificar estado de los LEDs en la consola

            // Actualizar cada LED individualmente
            actualizarEstado('led1', data.led1_status);
            actualizarEstado('led2', data.led2_status);
            actualizarEstado('led3', data.led3_status);
            actualizarEstado('led4', data.led4_status);
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs:", error);

            // Mostrar mensaje de error para cada LED
            ['led1', 'led2', 'led3', 'led4'].forEach(ledId => {
                document.getElementById(`${ledId}-status-text`).innerText = 'Error al cargar';
            });
        });
}

// Función para cambiar el estado del LED cuando se activa el interruptor
function toggleLED(ledId) {
    const ledSwitch = document.getElementById(`${ledId}-switch`);
    const estado = ledSwitch.checked ? 1 : 0;

    fetch('https://intento-final.azurewebsites.net/api/updateled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `esp_id=ESP32_01&${ledId}_status=${estado}` // Asegúrate de incluir el esp_id y el LED correspondiente
    })
    .then(response => {
        if (response.ok) {
            console.log(`Estado de ${ledId} actualizado`);
            document.getElementById(`${ledId}-status-text`).innerText = estado == 1 ? 'Encendido' : 'Apagado';
        } else {
            console.error(`Error al actualizar el estado de ${ledId}`);
        }
    })
    .catch(error => {
        console.error(`Error al cambiar el estado de ${ledId}:`, error);
        document.getElementById(`${ledId}-status-text`).innerText = 'Error al actualizar';
    });
}

// Llamar a la función para actualizar el estado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarEstado(); // Actualizar estado inmediatamente al cargar la página

    // Establecer intervalo para actualizar el estado cada 5 segundos
    setInterval(actualizarEstado, 5000);

    // Escuchar eventos de cambio en los switches de LEDs
    ['led1', 'led2', 'led3', 'led4'].forEach(ledId => {
        document.getElementById(`${ledId}-switch`).addEventListener('change', function () {
            toggleLED(ledId);
        });
    });
});
