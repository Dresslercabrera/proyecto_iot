#include <WiFi.h>
#include <HTTPClient.h>

// =============== CONFIGURACIÓN WIFI ===============
const char* ssid = "DIRECCION";                 // ⚠️ Tu SSID WiFi
const char* password = "DREHCO0123456789*";     // ⚠️ Tu contraseña WiFi

// =============== CONFIGURACIÓN SERVIDOR ===============
// Reemplaza con la IP de tu PC donde corre Node.js + puerto 4000
const char* serverName = "http://192.168.2.119:4000/api/sensores";

// =============== PINES DE SENSORES ===============
// Importante: usar pines ADC del ESP32 (GPIO34, GPIO35, GPIO36, GPIO39, etc.)
const int pinKY037 = 34;   // Micrófono KY-037
const int pinLDR   = 35;   // Sensor LDR

// =============== UMBRALES DE AMBIENTE ===============
const int RUIDO_BAJO      = 800;      
const int RUIDO_MODERADO  = 1500; 
const int RUIDO_ALTO      = 2000;     

const int LUZ_BAJA        = 1000;       
const int LUZ_ALTA        = 3000;       

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Conectado a WiFi");
  Serial.print("📡 IP ESP32: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Leer valores de los sensores (ADC → rango 0–4095 en ESP32)
  int valorSonido = analogRead(pinKY037);
  int valorLuz = analogRead(pinLDR);

  // ================= CLASIFICACIÓN DE RUIDO =================
  String nivelRuido;
  if (valorSonido < RUIDO_BAJO) nivelRuido = "Bajo";
  else if (valorSonido < RUIDO_MODERADO) nivelRuido = "Moderado";
  else nivelRuido = "Alto";

  // ================= CLASIFICACIÓN DE LUZ =================
  String nivelLuz;
  if (valorLuz < LUZ_BAJA) nivelLuz = "Oscuro";
  else if (valorLuz < LUZ_ALTA) nivelLuz = "Normal";
  else nivelLuz = "Brillante";

  // ================= MONITOR SERIE =================
  Serial.println("==================================");
  Serial.print("🎤 Sonido: "); Serial.print(valorSonido);
  Serial.print(" → "); Serial.println(nivelRuido);
  Serial.print("💡 Luz: "); Serial.print(valorLuz);
  Serial.print(" → "); Serial.println(nivelLuz);

  // ================= ENVÍO AL SERVIDOR =================
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Crear JSON con los valores actuales
    String jsonData = "{";
    jsonData += "\"luz\": " + String(valorLuz) + ",";
    jsonData += "\"sonido\": " + String(valorSonido);
    jsonData += "}";

    // Enviar POST
    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.print("📡 Servidor respondió (HTTP ");
      Serial.print(httpResponseCode);
      Serial.println("):");
      Serial.println(http.getString());
    } else {
      Serial.print("❌ Error en POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("⚠️ WiFi desconectado, no se pudo enviar");
  }

  delay(5000); // Esperar 5s antes de la siguiente lectura
}

