#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>

// ========== CONFIGURACIÓN ==========
const char* ssid = "OEEM1";
const char* password = "4919044OEEM";
const char* serverUrl = "http://192.168.0.10:8000/api";

// ========== PINES ==========
#define RX_PIN      16
#define TX_PIN      17
#define TOUCH_PIN   4
#define LED_PIN     2

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

int currentUserId = 0;
bool registrando = false;

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(TOUCH_PIN, INPUT_PULLUP);
  
  Serial.println("\n=== SISTEMA DE HUELLAS HOSPITAL ===");
  
  // Conectar WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("📡 IP del ESP32: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Error de WiFi");
  }
  
  // Inicializar sensor
  mySerial.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  finger.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("✅ Sensor AS608 detectado!");
  } else {
    Serial.println("❌ Sensor no encontrado!");
  }
  
  // Mostrar información de memoria del sensor
  mostrarInfoSensor();
  
  Serial.println("\n📌 ESP32 LISTO");
  Serial.println("Comandos disponibles:");
  Serial.println("  '1' - Registrar huella (manual)");
  Serial.println("  '2' - Limpiar memoria del sensor");
  Serial.println("  '3' - Ver información del sensor");
}

// ========== MOSTRAR INFO DEL SENSOR ==========
void mostrarInfoSensor() {
  Serial.println("\n=== INFO SENSOR ===");
  
  // Obtener número de huellas registradas
  uint8_t count = 0;
  for (int i = 0; i < 127; i++) {
    if (finger.loadModel(i) == FINGERPRINT_OK) {
      count++;
    }
  }
  
  Serial.print("📀 Huellas en memoria del sensor: ");
  Serial.print(count);
  Serial.println(" / 127");
  
  if (count > 0) {
    Serial.print("⚠️ Memoria del sensor al ");
    Serial.print((count * 100 / 127));
    Serial.println("% de capacidad");
  }
}

// ========== LIMPIAR MEMORIA DEL SENSOR ==========
void limpiarMemoriaSensor() {
  Serial.println("\n🗑️ LIMPIANDO MEMORIA DEL SENSOR...");
  
  uint8_t eliminadas = 0;
  for (int i = 0; i < 127; i++) {
    if (finger.deleteModel(i) == FINGERPRINT_OK) {
      eliminadas++;
      Serial.print(".");
    }
    delay(10);
  }
  
  Serial.println("\n✅ Memoria limpiada!");
  Serial.print("Se eliminaron ");
  Serial.print(eliminadas);
  Serial.println(" huellas");
  
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  
  mostrarInfoSensor();
}

// ========== ACTUALIZAR ESTADO EN EL SERVIDOR ==========
void actualizarEstado(int userId, int paso, bool completado, String templateData) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(serverUrl) + "/huellas/actualizar-estado";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  StaticJsonDocument<256> doc;
  doc["user_id"] = userId;
  doc["paso"] = paso;
  doc["completado"] = completado;
  doc["template"] = templateData;
  doc["error"] = false;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpCode = http.POST(jsonString);
  http.end();
  
  Serial.print("📡 Estado actualizado: Paso ");
  Serial.println(paso);
}

// ========== CAPTURAR HUELLA ==========
bool capturarHuella(int userId) {
  Serial.println("\n=========================================");
  Serial.println("👆 REGISTRO DE HUELLA");
  Serial.print("Usuario ID: ");
  Serial.println(userId);
  Serial.println("=========================================");
  
  actualizarEstado(userId, 1, false, "");
  
  // Esperar dedo con timeout más largo
  Serial.println("1️⃣ Coloca tu DEDO en el sensor...");
  uint8_t p = -1;
  int timeout = 0;
  const int maxTimeout = 60; // 60 segundos máximo
  
  while (p != FINGERPRINT_OK && timeout < maxTimeout) {
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
    Serial.println("\n❌ Timeout: No se detectó dedo");
    actualizarEstado(userId, 1, false, "error");
    return false;
  }
  
  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("❌ Error al procesar imagen");
    return false;
  }
  
  Serial.println("2️⃣ RETIRA el dedo...");
  actualizarEstado(userId, 2, false, "");
  delay(2000);
  
  while (finger.getImage() != FINGERPRINT_NOFINGER) {
    delay(100);
  }
  
  // Segunda imagen
  Serial.println("3️⃣ Coloca el MISMO DEDO nuevamente...");
  actualizarEstado(userId, 3, false, "");
  
  p = -1;
  timeout = 0;
  while (p != FINGERPRINT_OK && timeout < maxTimeout) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      if (timeout % 10 == 0) Serial.print(".");
      delay(500);
      timeout++;
    }
  }
  
  if (p != FINGERPRINT_OK) {
    Serial.println("\n❌ Timeout: No se detectó segunda huella");
    return false;
  }
  
  Serial.println("\n✅ Imagen 2 capturada!");
  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("❌ Error al procesar segunda imagen");
    return false;
  }
  
  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("❌ Las huellas NO coinciden!");
    actualizarEstado(userId, 3, false, "error");
    return false;
  }
  
  // Guardar en memoria del sensor (opcional, pero útil para verificación rápida)
  p = finger.storeModel(userId);
  if (p != FINGERPRINT_OK) {
    Serial.println("❌ Error al guardar en memoria del sensor");
  } else {
    Serial.println("✅ Huella guardada en memoria del sensor");
  }
  
  Serial.println("✅ HUELLA REGISTRADA EXITOSAMENTE!");
  
  // Enviar al servidor
  String huellaData = String(userId) + "_" + String(millis());
  actualizarEstado(userId, 4, true, huellaData);
  
  // Feedback visual
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  mostrarInfoSensor();
  return true;
}

// ========== VERIFICAR HUELLA ==========
int verificarHuella() {
  Serial.println("\n🔍 VERIFICANDO HUELLA...");
  Serial.println("👆 Coloca tu dedo en el sensor");
  
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) {
    if (p == FINGERPRINT_NOFINGER) {
      Serial.println("❌ No se detectó dedo");
    }
    return -1;
  }
  
  Serial.println("✅ Imagen capturada");
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;
  
  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.print("✅ ¡HUELLA RECONOCIDA! ID: ");
    Serial.print(finger.fingerID);
    Serial.print(" | Confianza: ");
    Serial.println(finger.confidence);
    
    // Feedback: LED parpadea 2 veces
    for (int i = 0; i < 2; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }
    
    return finger.fingerID;
  }
  
  if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("❌ Huella NO registrada");
    // Feedback: LED parpadeo rápido de error
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(50);
      digitalWrite(LED_PIN, LOW);
      delay(50);
    }
  }
  
  return -1;
}

// ========== LOOP PRINCIPAL (CORREGIDO) ==========
void loop() {
  // Detección automática de dedo (para verificación)
  if (digitalRead(TOUCH_PIN) == LOW) {
    delay(300); // Debounce
    if (!registrando) {
      int id = verificarHuella();
      if (id > 0) {
        Serial.println("🔓 ACCESO CONCEDIDO");
        Serial.println("=========================================");
      } else {
        Serial.println("🔒 ACCESO DENEGADO");
        Serial.println("=========================================");
      }
    }
    delay(1000); // Esperar antes de otra lectura
  }
  
  // Comandos manuales por serial
  if (Serial.available()) {
    char cmd = Serial.read();
    
    switch(cmd) {
      case '1': {
        // Registrar huella
        registrando = true;
        Serial.print("📝 Ingrese ID de usuario: ");
        while (!Serial.available()) delay(100);
        currentUserId = Serial.parseInt();
        capturarHuella(currentUserId);
        registrando = false;
        break;
      }
      
      case '2': {
        // Limpiar memoria - CORREGIDO con llaves
        Serial.print("⚠️ ¿Limpiar TODA la memoria del sensor? (s/n): ");
        while (!Serial.available()) delay(100);
        char confirm = Serial.read();
        if (confirm == 's' || confirm == 'S') {
          limpiarMemoriaSensor();
        } else {
          Serial.println("❌ Cancelado");
        }
        break;
      }
      
      case '3': {
        // Ver información del sensor
        mostrarInfoSensor();
        break;
      }
      
      default:
        break;
    }
  }
  
  delay(100);
}