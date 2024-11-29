from flask import Flask, request, jsonify, render_template, send_from_directory
import pyodbc
from flask_cors import CORS
app = Flask(__name__, static_folder='static', template_folder='templates')
 
# Habilitar CORS para toda la aplicación
CORS(app)

# Función para crear la conexión a la base de datos SQL Server
def create_connection():
    try:
        connection = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=iot-server-fiee.database.windows.net;'
            'DATABASE=iot_db;'
            'UID=admin_iot;'
            'PWD=Focm24681012'
        )
        print("Conexión exitosa") 
        return connection
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

@app.route('/plugins/<path:filename>')
def serve_plugins(filename):
    return send_from_directory('/home/admin_prueba/Proyecto IoT - FIEE/Proyecto IoT -VM/plugins', filename)

# Rutas para renderizar
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/PrimerPiso')
def primer_piso():
    return render_template('PrimerPiso.html')

@app.route('/SegundoPiso')
def segundo_piso():
    return render_template('SegundoPiso.html')

@app.route('/TercerPiso')
def tercer_piso():
    return render_template('TercerPiso.html')

@app.route('/inicio')
def inicio():
    return render_template('index2.html')

@app.route('/Escenas')
def escenas():
    return render_template('Escenas.html')

@app.route('/CuartoPiso')
def cuarto_piso():
    return render_template('CuartoPiso.html')

# Ruta para insertar o actualizar datos del ESP32 (sensores)
@app.route('/api/insertdata', methods=['POST'])
def insert_data():
    try:
        mydb = create_connection()
        if mydb is None:
            return jsonify({"error": "Conexión a la base de datos no disponible"}), 500

        # Obtener datos JSON del cuerpo de la solicitud
        data = request.get_json()
        if not data:
            return jsonify({"error": "Faltan datos o formato JSON incorrecto"}), 400

        esp_id = data.get('esp_id')
        pir_status = data.get('pir_status')
        pir1_status = data.get('pir1_status')
        pir2_status = data.get('pir2_status')
        ldr_status = data.get('ldr_status')
        ldr1_status = data.get('ldr1_status')
        ldr2_status = data.get('ldr2_status')
        nivel_agua = data.get('nivel_agua')
        metal_detectado = data.get('metal_detectado')
        temperatura = data.get('temperatura')

        cursor = mydb.cursor()

        # Verificar si ya existe un registro con ese esp_id
        query_check = "SELECT * FROM sensor_data WHERE esp_id = ?"
        cursor.execute(query_check, (esp_id,))
        result = cursor.fetchone()

        # Si existe un registro, actualizamos los valores
        if result:
            query_update = """
            UPDATE sensor_data 
            SET pir_status = ?, pir1_status = ?, pir2_status = ?, ldr_status = ?, ldr1_status = ?, ldr2_status = ?, nivel_agua = ?, metal_detectado = ?, temperatura = ?
            WHERE esp_id = ?
            """
            cursor.execute(query_update, (pir_status, pir1_status, pir2_status, ldr_status, ldr1_status, ldr2_status, nivel_agua, metal_detectado, temperatura, esp_id))
        else:
            # Si no existe, insertamos un nuevo registro
            query_insert = """
            INSERT INTO sensor_data (esp_id, pir_status, pir1_status, pir2_status, ldr_status, ldr1_status, ldr2_status, nivel_agua, metal_detectado, temperatura)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(query_insert, (esp_id, pir_status, pir1_status, pir2_status, ldr_status, ldr1_status, ldr2_status, nivel_agua, metal_detectado, temperatura))

        mydb.commit()
        cursor.close()
        mydb.close()
        return jsonify({"message": "Datos actualizados con éxito"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para obtener el estado más reciente de los sensores
@app.route('/api/getlateststatus', methods=['GET'])
def get_latest_status():
    try:
        esp_id = request.args.get('esp_id')
        mydb = create_connection()
        if mydb is None:
            return jsonify({"error": "Conexión a la base de datos no disponible"}), 500

        cursor = mydb.cursor()
        cursor.execute("""
        SELECT pir_status, pir1_status, pir2_status, ldr_status, ldr1_status, ldr2_status, nivel_agua, metal_detectado, temperatura 
        FROM sensor_data 
        WHERE esp_id = ? ORDER BY id DESC
        """, (esp_id,))
        
        columns = [column[0] for column in cursor.description]
        result = cursor.fetchone()
        cursor.close()
        mydb.close()

        if result:
            result_dict = dict(zip(columns, result))
            return jsonify(result_dict)
        else:
            return jsonify({"error": "No hay datos para el esp_id proporcionado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/updateled', methods=['POST'])
def update_led():
    try:
        mydb = create_connection()
        if mydb is None:
            return jsonify({"error": "Conexión a la base de datos no disponible"}), 500

        data = request.get_json()
        if not data:
            return jsonify({"error": "Faltan datos o formato JSON incorrecto"}), 400

        # Obtener estados de los LEDs
        esp_id = data.get('esp_id')
        led_status = {
            'led1_status': data.get('led1_status'),
            'led2_status': data.get('led2_status'),
            'led3_status': data.get('led3_status'),
            'led4_status': data.get('led4_status'),
            'led5_status': data.get('led5_status'),
            'led6_status': data.get('led6_status'),
            'led7_status': data.get('led7_status'),
            'led8_status': data.get('led8_status'),
            'led9_status': data.get('led9_status'),
            'led10_status': data.get('led10_status'),
        }

        # Filtrar los LEDs que tienen valores
        updated_leds = {key: value for key, value in led_status.items() if value is not None}

        if not updated_leds:
            return jsonify({"error": "No se proporcionaron estados de LEDs para actualizar"}), 400

        cursor = mydb.cursor()

        # Construir la consulta SQL dinámica
        set_clause = ", ".join([f"{key} = ?" for key in updated_leds.keys()])
        values = list(updated_leds.values())
        values.append(esp_id)  # Agregar esp_id al final para WHERE

        query_update = f"UPDATE sensor_data SET {set_clause} WHERE esp_id = ?"
        cursor.execute(query_update, tuple(values))

        # Commit de la transacción
        mydb.commit()

        # Verificar si se actualizó algo
        if cursor.rowcount > 0:
            message = "LEDs actualizados correctamente"
        else:
            message = "No se encontró el dispositivo con ese esp_id o no hubo cambios"

        cursor.close()
        mydb.close()

        return jsonify({"message": message}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/getledstatus', methods=['GET'])
def get_led_status():
    try:
        esp_id = request.args.get('esp_id')
        mydb = create_connection()
        
        if mydb is None:
            return jsonify({"error": "Conexión a la base de datos no disponible"}), 500
        
        cursor = mydb.cursor()
        cursor.execute("""
        SELECT led1_status, led2_status, led3_status, led4_status, led5_status, led6_status, led7_status, led8_status, 
               led9_status, led10_status
        FROM sensor_data 
        WHERE esp_id = ? ORDER BY id DESC
        """, (esp_id,))
        
        columns = [column[0] for column in cursor.description]
        result = cursor.fetchone()
        cursor.close()
        mydb.close()

        if result:
            result_dict = dict(zip(columns, result))
            return jsonify(result_dict)
        else:
            return jsonify({"error": "No hay datos para el esp_id proporcionado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 8000))  # Toma el puerto de la variable de entorno PORT, o 8000 como predeterminado.
    app.run(host='0.0.0.0', port=port)
