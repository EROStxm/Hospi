#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>

// ========== CONFIGURACIÓN WiFi ==========
const char* ssid = "OEEM1";
const char* password = "4919044OEEM";

// ========== CONFIGURACIÓN MQTT ==========
//const char* mqtt_server = "192.168.0.10";
const char* mqtt_server = "10.144.66.211";
const int mqtt_port = 1883;
const char* mqtt_topic_huellas = "hospital/huellas";
const char* mqtt_topic_comandos = "hospital/comandos";

// ========== PINES ==========
#define RX_PIN      16
#define TX_PIN      17
#define TOUCH_PIN   4
#define LED_PIN     2

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
WiFiClient espClient;
PubSubClient client(espClient);

int currentUserId = 0;
bool registrando = false;
int pasoActual = 0;
unsigned long lastReconnectAttempt = 0;

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(TOUCH_PIN, INPUT_PULLUP);
  
  Serial.println("\n=== SISTEMA DE HUELLAS CON MQTT ===");
  
  // Conectar WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi conectado!");
  Serial.print("📡 IP: ");
  Serial.println(WiFi.localIP());
  
  // Configurar MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Inicializar sensor
  mySerial.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  finger.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("✅ Sensor AS608 detectado!");
  } else {
    Serial.println("❌ Sensor no encontrado!");
  }
  
  mostrarInfoSensor();
  Serial.println("\n📌 ESP32 LISTO - Esperando conexión MQTT...");
}

// ========== CALLBACK MQTT (recibe comandos) ==========
void callback(char* topic, byte* payload, unsigned int length) {
  String mensaje = "";
  for (int i = 0; i < length; i++) {
    mensaje += (char)payload[i];
  }
  
  Serial.print("📨 Comando MQTT recibido: ");
  Serial.println(mensaje);
  
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, mensaje);
  
  if (!error) {
    String comando = doc["comando"];
    
    if (comando == "registrar") {
      currentUserId = doc["user_id"];
      registrando = true;
      
      Serial.print("📝 Registrando usuario ID: ");
      Serial.println(currentUserId);
      
      // Iniciar registro en función separada
      capturarHuella(currentUserId);
      registrando = false;
    }
    else if (comando == "limpiar") {
      limpiarMemoriaSensor();
    }
    else if (comando == "info") {
      mostrarInfoSensor();
      publicarInfoSensor();
    }
  }
}

// ========== PUBLICAR ESTADO ==========
void publicarEstado(int paso, String mensaje) {
  StaticJsonDocument<200> doc;
  doc["tipo"] = "estado";
  doc["paso"] = paso;
  doc["mensaje"] = mensaje;
  doc["user_id"] = currentUserId;
  
  if (paso == 4) {
    doc["completado"] = true;
    doc["template"] = String(currentUserId) + "_" + String(millis());
  }
  
  String output;
  serializeJson(doc, output);
  
  if (client.connected()) {
    client.publish(mqtt_topic_huellas, output.c_str());
  }
  
  Serial.print("📤 Estado publicado: Paso ");
  Serial.print(paso);
  Serial.print(" - ");
  Serial.println(mensaje);
}

// ========== PUBLICAR INFO ==========
void publicarInfoSensor() {
  uint8_t count = 0;
  for (int i = 0; i < 127; i++) {
    if (finger.loadModel(i) == FINGERPRINT_OK) {
      count++;
    }
  }
  
  StaticJsonDocument<200> doc;
  doc["tipo"] = "info";
  doc["huellas_memoria"] = count;
  doc["capacidad_maxima"] = 127;
  
  String output;
  serializeJson(doc, output);
  client.publish(mqtt_topic_huellas, output.c_str());
}

// ========== MOSTRAR INFO ==========
void mostrarInfoSensor() {
  uint8_t count = 0;
  for (int i = 0; i < 127; i++) {
    if (finger.loadModel(i) == FINGERPRINT_OK) {
      count++;
    }
  }
  
  Serial.print("📀 Huellas en memoria: ");
  Serial.print(count);
  Serial.println(" / 127");
}

// ========== LIMPIAR MEMORIA ==========
void limpiarMemoriaSensor() {
  Serial.println("\n🗑️ LIMPIANDO MEMORIA...");
  
  uint8_t eliminadas = 0;
  for (int i = 0; i < 127; i++) {
    if (finger.deleteModel(i) == FINGERPRINT_OK) {
      eliminadas++;
    }
    delay(10);
  }
  
  Serial.print("✅ Eliminadas: ");
  Serial.println(eliminadas);
  mostrarInfoSensor();
  publicarInfoSensor();
  
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
}

// ========== CAPTURAR HUELLA ==========
bool capturarHuella(int userId) {
  Serial.println("\n=========================================");
  Serial.println("👆 REGISTRO DE HUELLA");
  Serial.print("Usuario ID: ");
  Serial.println(userId);
  
  publicarEstado(1, "Coloca tu dedo en el sensor...");
  digitalWrite(LED_PIN, HIGH);
  
  uint8_t p = -1;
  int timeout = 0;
  
  Serial.println("1️⃣ Coloca tu DEDO en el sensor...");
  while (p != FINGERPRINT_OK && timeout < 60) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      if (timeout % 10 == 0) Serial.print(".");
      delay(500);
      timeout++;
    } else if (p == FINGERPRINT_OK) {
      Serial.println("\n✅ Imagen 1 capturada!");
    }
  }
  
  if (p != FINGERPRINT_OK) {
    Serial.println("\n❌ Timeout");
    publicarEstado(1, "Error: Timeout");
    digitalWrite(LED_PIN, LOW);
    return false;
  }
  
  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) return false;
  
  publicarEstado(2, "Retira el dedo...");
  Serial.println("2️⃣ RETIRA el dedo...");
  delay(2000);
  
  while (finger.getImage() != FINGERPRINT_NOFINGER) delay(100);
  
  publicarEstado(3, "Coloca el MISMO dedo nuevamente...");
  Serial.println("3️⃣ Coloca el MISMO DEDO nuevamente...");
  
  p = -1;
  timeout = 0;
  while (p != FINGERPRINT_OK && timeout < 60) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      if (timeout % 10 == 0) Serial.print(".");
      delay(500);
      timeout++;
    }
  }
  
  if (p != FINGERPRINT_OK) {
    Serial.println("\n❌ Timeout");
    return false;
  }
  
  Serial.println("\n✅ Imagen 2 capturada!");
  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) return false;
  
  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("❌ Las huellas NO coinciden!");
    publicarEstado(3, "Error: Las huellas no coinciden");
    digitalWrite(LED_PIN, LOW);
    return false;
  }
  
  p = finger.storeModel(userId);
  if (p != FINGERPRINT_OK) {
    Serial.println("❌ Error al guardar");
  } else {
    Serial.println("✅ Huella guardada en memoria!");
  }
  
  Serial.println("✅ HUELLA REGISTRADA EXITOSAMENTE!");
  publicarEstado(4, "¡Huella registrada exitosamente!");
  
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  mostrarInfoSensor();
  publicarInfoSensor();
  return true;
}

// ========== VERIFICAR HUELLA ==========
int verificarHuella() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) return -1;
  
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;
  
  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.print("✅ HUELLA RECONOCIDA! ID: ");
    Serial.print(finger.fingerID);
    Serial.print(" | Confianza: ");
    Serial.println(finger.confidence);
    
    // Publicar verificación exitosa
    StaticJsonDocument<200> doc;
    doc["tipo"] = "verificacion";
    doc["user_id"] = finger.fingerID;
    doc["exito"] = true;
    doc["confianza"] = finger.confidence;
    String output;
    serializeJson(doc, output);
    client.publish(mqtt_topic_huellas, output.c_str());
    
    // Feedback LED
    for (int i = 0; i < 2; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }
    return finger.fingerID;
  }
  
  Serial.println("❌ Huella NO registrada");
  
  // Publicar verificación fallida
  StaticJsonDocument<200> doc;
  doc["tipo"] = "verificacion";
  doc["exito"] = false;
  String output;
  serializeJson(doc, output);
  client.publish(mqtt_topic_huellas, output.c_str());
  
  // Feedback error
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(50);
    digitalWrite(LED_PIN, LOW);
    delay(50);
  }
  return -1;
}

// ========== RECONECTAR MQTT ==========
void reconnectMQTT() {
  if (!client.connected()) {
    Serial.print("🔄 Conectando a MQTT...");
    
    if (client.connect("ESP32_Huellas_001")) {
      Serial.println("✅ Conectado!");
      client.subscribe(mqtt_topic_comandos);
      Serial.print("📡 Suscrito a: ");
      Serial.println(mqtt_topic_comandos);
      
      // Publicar estado online
      StaticJsonDocument<200> doc;
      doc["tipo"] = "conexion";
      doc["estado"] = "online";
      doc["ip"] = WiFi.localIP().toString();
      String output;
      serializeJson(doc, output);
      client.publish(mqtt_topic_huellas, output.c_str());
      
      publicarInfoSensor();
    } else {
      Serial.print("❌ Falló, rc=");
      Serial.println(client.state());
    }
  }
}

// ========== LOOP PRINCIPAL ==========
void loop() {
  // Reconectar MQTT si es necesario
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Detección automática de dedo (solo si no está registrando)
  if (digitalRead(TOUCH_PIN) == LOW && !registrando) {
    delay(300);
    int id = verificarHuella();
    if (id > 0) {
      Serial.println("🔓 ACCESO CONCEDIDO");
      Serial.println("=========================================");
    } else {
      Serial.println("🔒 ACCESO DENEGADO");
      Serial.println("=========================================");
    }
    delay(1000);
  }
  
  // Comandos manuales por serial
  if (Serial.available()) {
    char cmd = Serial.read();
    switch(cmd) {
      case '1':
        Serial.print("📝 ID de usuario: ");
        while (!Serial.available()) delay(100);
        currentUserId = Serial.parseInt();
        registrando = true;
        capturarHuella(currentUserId);
        registrando = false;
        break;
      case '2':
        limpiarMemoriaSensor();
        break;
      case '3':
        mostrarInfoSensor();
        break;
    }
  }
  
  delay(100);
}