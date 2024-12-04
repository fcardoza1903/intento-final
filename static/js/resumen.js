function actualizarResumen() {
    let ledsOnCount = 0;  // Contador de LEDs encendidos
    let ledsOffCount = 0; // Contador de LEDs apagados

    // Procesar ESP32_01
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            for (let i = 1; i <= 4; i++) {
                if (data[`led${i}_status`] === true) {
                    ledsOnCount++;
                } else {
                    ledsOffCount++;
                }
            }
            if (data.led10_status === true) {
                ledsOnCount++;
            } else {
                ledsOffCount++;
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs (ESP32_01):", error);
        });

    // Procesar ESP32_02
    fetch('https://intento-final.azurewebsites.net/api/getledstatus?esp_id=ESP32_02')
        .then(response => response.json())
        .then(data => {
            for (let i = 5; i <= 10; i++) {
                if (data[`led${i}_status`] === true) {
                    ledsOnCount++;
                } else {
                    ledsOffCount++;
                }
            }

            // Actualizar los contadores en el HTML
            document.getElementById('ledON-total-text').innerText = ledsOnCount;
            document.getElementById('ledOFF-total-text').innerText = ledsOffCount;
        })
        .catch(error => {
            console.error("Error al obtener el estado de los LEDs (ESP32_02):", error);
        });
}

function actualizarMovimiento() {
    let piso1Movimiento = false;
    let piso2Movimiento = false;

    // Fetch para el ESP32_01 (Piso 1)
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            piso1Movimiento = data.pir_status === true;

            // Después de procesar el ESP32_01, consulta el ESP32_02
            return fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_02');
        })
        .then(response => response.json())
        .then(data => {
            piso2Movimiento = data.pir1_status === true;

            // Actualizar la interfaz
            actualizarBoxMovimiento(piso1Movimiento, piso2Movimiento);
        })
        .catch(error => {
            console.error("Error al obtener el estado de los sensores:", error);
            actualizarBoxMovimiento(null, null); // Estado de error
        });
}

function actualizarBoxMovimiento(piso1, piso2) {
    const box = document.getElementById('pir-status-box');
    const icon = document.getElementById('pir-icon');
    const statusText = document.getElementById('pir-status-text');

    if (piso1 === null || piso2 === null) {
        // Error al cargar datos
        box.className = 'box pir-neutral';
        icon.style.color = 'black';
        statusText.innerText = 'Error al cargar datos';
    } else if (piso1 && piso2) {
        // Movimiento en ambos pisos
        box.className = 'box pir-active';
        icon.style.color = '#FFD43B'; // Huellas amarillas
        statusText.innerText = 'Se detectó movimiento en piso 1 y 2';
    } else if (piso1) {
        // Movimiento solo en piso 1
        box.className = 'box pir-active';
        icon.style.color = '#FFD43B'; // Huellas amarillas
        statusText.innerText = 'Se detectó movimiento en el piso 1';
    } else if (piso2) {
        // Movimiento solo en piso 2
        box.className = 'box pir-active';
        icon.style.color = '#FFD43B'; // Huellas amarillas
        statusText.innerText = 'Se detectó movimiento en el piso 2';
    } else {
        // Sin movimiento
        box.className = 'box pir-inactive';
        icon.style.color = 'black'; // Huellas negras
        statusText.innerText = 'No hay movimiento en el edificio';
    }
}

function actualizarEstadoJardin() {
    // Fetch para obtener el estado del nivel de agua
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos del nivel de agua:", data);

            const gardenBox = document.getElementById('garden-status-box');
            const gardenIcon = document.getElementById('garden-icon');
            const gardenText = document.getElementById('garden-status-text');

            // Determinar el estado del nivel de agua
            if (data.nivel_agua !== undefined && data.nivel_agua < 0.5) {
                // Nivel de agua bajo
                gardenBox.className = 'box water-low';
                gardenIcon.className = 'fa fa-tint'; // Ícono de gota
                gardenText.innerText = 'El jardín necesita agua';
            } else if (data.nivel_agua !== undefined && data.nivel_agua >= 0.5) {
                // Nivel de agua alto
                gardenBox.className = 'box water-high';
                gardenIcon.className = 'fa-solid fa-circle-check'; // Ícono de check
                gardenText.innerText = 'El nivel de agua es alto';
            } else {
                // Datos no disponibles
                gardenBox.className = 'box water-neutral';
                gardenIcon.className = 'fa fa-question-circle'; // Ícono de interrogación
                gardenText.innerText = 'Dato no disponible';
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado del nivel de agua:", error);

            // Mostrar error
            const gardenBox = document.getElementById('garden-status-box');
            const gardenIcon = document.getElementById('garden-icon');
            const gardenText = document.getElementById('garden-status-text');

            gardenBox.className = 'box water-neutral';
            gardenIcon.className = 'fa fa-exclamation-triangle'; // Ícono de advertencia
            gardenText.innerText = 'Error al cargar datos';
        });
}

function actualizarEstadoPuerta() {
    // Fetch para obtener el estado del sensor de la puerta
    fetch('https://intento-final.azurewebsites.net/api/getlateststatus?esp_id=ESP32_01')
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos del sensor de puerta:", data);

            // Referencias a elementos del DOM
            const doorBox = document.getElementById('door-status-box');
            const doorIcon = document.getElementById('door-icon');
            const doorTitle = document.getElementById('door-status-title');
            const doorText = document.getElementById('door-status-text');

            // Actualizar estado según el metal detectado
            if (data.metal_detectado === true) {
                // Puerta abierta
                doorBox.className = 'box door-open';
                doorIcon.className = 'fa fa-door-open'; // Ícono de puerta abierta
                doorTitle.innerText = 'Puerta Abierta';
                doorText.innerText = 'La puerta está abierta';
            } else if (data.metal_detectado === false) {
                // Puerta cerrada
                doorBox.className = 'box door-closed';
                doorIcon.className = 'fa fa-door-closed'; // Ícono de puerta cerrada
                doorTitle.innerText = 'Puerta Cerrada';
                doorText.innerText = 'La puerta está cerrada';
            } else {
                // Estado desconocido
                doorBox.className = 'box';
                doorIcon.className = 'fa fa-question-circle'; // Ícono de interrogación
                doorTitle.innerText = 'Estado Desconocido';
                doorText.innerText = 'No se pudo determinar el estado de la puerta';
            }
        })
        .catch(error => {
            console.error("Error al obtener el estado de la puerta:", error);

            // Mostrar error
            const doorBox = document.getElementById('door-status-box');
            const doorIcon = document.getElementById('door-icon');
            const doorTitle = document.getElementById('door-status-title');
            const doorText = document.getElementById('door-status-text');

            doorBox.className = 'box';
            doorIcon.className = 'fa fa-exclamation-triangle'; // Ícono de advertencia
            doorTitle.innerText = 'Error';
            doorText.innerText = 'Error al cargar el estado de la puerta';
        });
}

document.addEventListener("DOMContentLoaded", function () {
// Llamadas iniciales
actualizarResumen();
actualizarMovimiento();
actualizarEstadoJardin();
actualizarEstadoPuerta();

// Configurar intervalos directamente
setInterval(actualizarResumen, 200);       
setInterval(actualizarMovimiento, 200);   // Actualizar el movimiento 
setInterval(actualizarEstadoJardin, 200); // Actualizar el estado del jardín 
setInterval(actualizarEstadoPuerta, 200); // Actualizar el estado de la puerta 
});
