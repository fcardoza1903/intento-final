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

# Ruta para actualizar el estado de los LEDs clásicos
@app.route('/api/updateled', methods=['POST'])
def update_led():
    try:
        mydb = create_connection()
        if mydb is None:
            return jsonify({"error": "Conexión a la base de datos no disponible"}), 500

        data = request.get_json()
        if not data:
            return jsonify({"error": "Faltan datos o formato JSON incorrecto"}), 400

        led1_status = data.get('led1_status')
        led2_status = data.get('led2_status')
        led3_status = data.get('led3_status')
        led4_status = data.get('led4_status')
        led5_status = data.get('led5_status')
        led6_status = data.get('led6_status')
        led7_status = data.get('led7_status')
        led8_status = data.get('led8_status')
        led9_status = data.get('led9_status')
        led10_status = data.get('led10_status')
        esp_id = data.get('esp_id')

        cursor = mydb.cursor()
        

        # Actualizamos los estados de los LEDs clásicos
        if led1_status is not None:
            query_update_led1 = "UPDATE sensor_data SET led1_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led1, (led1_status, esp_id))
            
        if led2_status is not None:
            query_update_led2 = "UPDATE sensor_data SET led2_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led2, (led2_status, esp_id))

        if led3_status is not None:
            query_update_led3 = "UPDATE sensor_data SET led3_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led3, (led3_status, esp_id))

        if led4_status is not None:
            query_update_led4 = "UPDATE sensor_data SET led4_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led4, (led4_status, esp_id))

        if led5_status is not None:
            query_update_led5 = "UPDATE sensor_data SET led5_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led5, (led5_status, esp_id))  
       
        if led6_status is not None:
            query_update_led6 = "UPDATE sensor_data SET led6_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led6, (led6_status, esp_id))  

        if led7_status is not None:
            query_update_led7 = "UPDATE sensor_data SET led7_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led7, (led7_status, esp_id))

        if led8_status is not None:
            query_update_led8 = "UPDATE sensor_data SET led8_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led8, (led8_status, esp_id))

        if led9_status is not None:
            query_update_led9 = "UPDATE sensor_data SET led9_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led9, (led9_status, esp_id))

        if led10_status is not None:
            query_update_led10 = "UPDATE sensor_data SET led10_status = ? WHERE esp_id = ?"
            cursor.execute(query_update_led10, (led10_status, esp_id))
            
        mydb.commit()
        cursor.close()
        mydb.close()
        return jsonify({"message": "LED actualizado"}), 200
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
