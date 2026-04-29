#include <Adafruit_Fingerprint.h>

// ========== DEFINICIÓN DE PINES ==========
#define RX_PIN      16    // RX2 ESP32 → TX sensor (amarillo)
#define TX_PIN      17    // TX2 ESP32 → RX sensor (verde)
#define TOUCH_PIN   4     // Pin azul - detección dedo
#define LED_SENSOR_PIN  5 // Pin blanco - LED del sensor
#define LED_CONTROL_PIN  2 // LED externo que controlaremos
#define BUTTON_PIN  15    // Pulsador con resistor 1kΩ

// ========== VARIABLES DE ESTADO ==========
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// Estados del sistema
enum SystemState {
  WAITING_FOR_BUTTON,    // Esperando que presiones el botón
  WAITING_FOR_FINGER,    // Esperando que pongas el dedo
  VERIFYING_FINGER,      // Verificando huella
  ACCESS_GRANTED,        // Acceso concedido (LED encendido)
  ACCESS_DENIED          // Acceso denegado (LED apagado)
};

SystemState currentState = WAITING_FOR_BUTTON;
bool ledState = false;     // Estado actual del LED controlado
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

// ID de usuario autorizado (guardar la huella con ID 1 primero)
const uint32_t AUTHORIZED_ID = 1;

// ========== CONFIGURACIÓN INICIAL ==========
void setup() {
  Serial.begin(115200);
  
  // Configurar pines
  pinMode(LED_CONTROL_PIN, OUTPUT);
  pinMode(LED_SENSOR_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Usamos pull-up interno + resistor externo
  
  digitalWrite(LED_CONTROL_PIN, LOW);   // LED apagado al inicio
  digitalWrite(LED_SENSOR_PIN, HIGH);   // LED del sensor encendido
  
  // Iniciar comunicación con sensor
  mySerial.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  finger.begin(57600);
  
  // Verificar sensor
  if (finger.verifyPassword()) {
    Serial.println("✅ Sensor AS608 detectado!");
    setSensorLED(100);
  } else {
    Serial.println("❌ ERROR: Sensor no encontrado!");
    while(1) {
      // Parpadeo rápido indicando error
      digitalWrite(LED_CONTROL_PIN, HIGH);
      delay(200);
      digitalWrite(LED_CONTROL_PIN, LOW);
      delay(200);
    }
  }
  
  Serial.println("\n=== SISTEMA DE AUTENTICACIÓN POR HUELLA ===");
  Serial.println("1. Presiona el botón para comenzar el registro");
  Serial.println("2. Coloca tu dedo en el sensor");
  Serial.println("3. El LED se encenderá si la huella coincide");
  Serial.println("===========================================\n");
  
  printMenu();
}

// ========== CONTROL DEL LED DEL SENSOR ==========
void setSensorLED(uint8_t brightness) {
  analogWrite(LED_SENSOR_PIN, brightness);
}

// ========== MENÚ DE OPCIONES ==========
void printMenu() {
  Serial.println("\n--- COMANDOS ---");
  Serial.println("B: Presionar botón (o presiona físicamente)");
  Serial.println("R: Registrar nueva huella");
  Serial.println("D: Borrar todas las huellas");
  Serial.println("L: Encender/Apagar LED manualmente");
  Serial.println("----------------");
}

// ========== REGISTRAR NUEVA HUELLA ==========
uint8_t enrollFingerprint(uint32_t id) {
  int p = -1;
  
  Serial.print("\n📝 Registrando huella ID #"); Serial.println(id);
  
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("✅ Imagen tomada");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("⚠️ Error de comunicación");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("⚠️ Error de imagen");
        break;
      default:
        Serial.println("⚠️ Error desconocido");
        break;
    }
    delay(50);
  }
  
  p = finger.image2Tz(1);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("✅ Imagen convertida");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("❌ Imagen muy desordenada");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("❌ Error de comunicación");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("❌ Error de características");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("❌ Imagen inválida");
      return p;
    default:
      Serial.println("❌ Error desconocido");
      return p;
  }
  
  Serial.println("🗑️ Retira el dedo");
  delay(2000);
  
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }
  
  p = -1;
  Serial.println("👆 Coloca el mismo dedo nuevamente");
  
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("✅ Imagen tomada");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      default:
        break;
    }
    delay(50);
  }
  
  p = finger.image2Tz(2);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("✅ Segunda imagen convertida");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("❌ Imagen muy desordenada");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("❌ Error de comunicación");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("❌ Error de características");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("❌ Imagen inválida");
      return p;
    default:
      Serial.println("❌ Error desconocido");
      return p;
  }
  
  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("✅ Huellas coinciden!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("❌ Error de comunicación");
    return p;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("❌ Las huellas no coinciden");
    return p;
  } else {
    Serial.println("❌ Error desconocido");
    return p;
  }
  
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("✅ Huella guardada! ID: " + String(id));
    setSensorLED(200);
    delay(500);
    setSensorLED(100);
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("❌ Error de comunicación");
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("❌ Ubicación inválida");
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("❌ Error al escribir en memoria flash");
    return p;
  } else {
    Serial.println("❌ Error desconocido");
    return p;
  }
  
  return FINGERPRINT_OK;
}

// ========== BORRAR TODAS LAS HUELLAS ==========
void clearAllFingerprints() {
  Serial.println("🗑️ Borrando todas las huellas...");
  
  for (int i = 0; i < 127; i++) {
    finger.deleteModel(i);
  }
  
  Serial.println("✅ Huellas borradas");
  delay(500);
}

// ========== VERIFICAR HUELLA ==========
bool verifyFingerprint() {
  uint8_t p = finger.getImage();
  
  if (p != FINGERPRINT_OK) {
    return false;
  }
  
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) {
    return false;
  }
  
  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("✅ ¡Huella encontrada! ID: " + String(finger.fingerID));
    return true;
  } else if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("❌ Huella no registrada");
    return false;
  } else {
    Serial.println("⚠️ Error en verificación");
    return false;
  }
}

// ========== ESCANEAR CON TIMEOUT ==========
bool scanFingerprintWithTimeout(unsigned long timeoutMs) {
  unsigned long startTime = millis();
  
  while (millis() - startTime < timeoutMs) {
    if (finger.getImage() == FINGERPRINT_OK) {
      delay(50);
      if (finger.image2Tz() == FINGERPRINT_OK) {
        if (finger.fingerSearch() == FINGERPRINT_OK) {
          return (finger.fingerID == AUTHORIZED_ID);
        }
      }
      return false;
    }
    delay(50);
  }
  return false;
}

// ========== LOOP PRINCIPAL ==========
void loop() {
  // Manejar comandos por serial
  if (Serial.available()) {
    char cmd = Serial.read();
    switch (cmd) {
      case 'R':
      case 'r':
        enrollFingerprint(AUTHORIZED_ID);
        break;
      case 'D':
      case 'd':
        clearAllFingerprints();
        break;
      case 'L':
      case 'l':
        ledState = !ledState;
        digitalWrite(LED_CONTROL_PIN, ledState);
        Serial.print("💡 LED manual: ");
        Serial.println(ledState ? "ENCENDIDO" : "APAGADO");
        break;
      case 'B':
      case 'b':
        // Simular presión de botón por serial
        handleButtonPress();
        break;
      default:
        printMenu();
        break;
    }
  }
  
  // Manejar pulsador físico con debounce
  int reading = digitalRead(BUTTON_PIN);
  
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastButtonState == HIGH) {
      // Botón presionado
      handleButtonPress();
    }
  }
  
  lastButtonState = reading;
  
  // Manejar estados
  switch (currentState) {
    case WAITING_FOR_BUTTON:
      // No hacer nada, esperar botón
      break;
      
    case WAITING_FOR_FINGER:
      Serial.println("👆 Coloca tu dedo en el sensor...");
      setSensorLED(150);  // LED brillante indicando listo para escanear
      
      // Esperar hasta 5 segundos por un dedo
      if (scanFingerprintWithTimeout(5000)) {
        currentState = ACCESS_GRANTED;
      } else {
        currentState = ACCESS_DENIED;
      }
      break;
      
    case VERIFYING_FINGER:
      // Ya se maneja dentro de scanFingerprintWithTimeout
      break;
      
    case ACCESS_GRANTED:
      Serial.println("\n🔓 ¡ACCESO CONCEDIDO!");
      Serial.println("💡 ENCENDIENDO LED");
      
      // Encender LED controlado
      digitalWrite(LED_CONTROL_PIN, HIGH);
      ledState = true;
      
      // Feedback visual en sensor
      setSensorLED(255);
      delay(500);
      setSensorLED(100);
      
      Serial.println("✅ LED encendido. Presiona el botón nuevamente para apagar.");
      currentState = WAITING_FOR_BUTTON;
      break;
      
    case ACCESS_DENIED:
      Serial.println("\n🔒 ¡ACCESO DENEGADO!");
      Serial.println("💡 APAGANDO LED");
      
      // Apagar LED controlado
      digitalWrite(LED_CONTROL_PIN, LOW);
      ledState = false;
      
      // Feedback visual en sensor (parpadeo rojo)
      for (int i = 0; i < 3; i++) {
        setSensorLED(0);
        delay(100);
        setSensorLED(255);
        delay(100);
      }
      setSensorLED(100);
      
      Serial.println("❌ LED apagado. Presiona el botón para intentar nuevamente.");
      currentState = WAITING_FOR_BUTTON;
      break;
  }
  
  delay(50);
}

// ========== MANEJAR PRESIÓN DE BOTÓN ==========
void handleButtonPress() {
  Serial.println("\n🔘 ¡Botón presionado!");
  
  if (currentState == WAITING_FOR_BUTTON) {
    currentState = WAITING_FOR_FINGER;
    Serial.println("🎯 Modo verificación activado");
  } else {
    Serial.println("⚠️ Sistema ocupado, espera...");
  }
}