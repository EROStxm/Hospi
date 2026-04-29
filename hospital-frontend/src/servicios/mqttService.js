// src/servicios/mqttService.js
import mqtt from 'mqtt';

class MqttService {
  constructor() {
    this.client = null;
    this.callbacks = {};
  }

  connect() {
    const options = {
      host: '192.168.0.10',
      port: 8083,  // Puerto WebSocket de Mosquitto
      protocol: 'ws'
    };
    
    this.client = mqtt.connect('ws://192.168.0.10:8083');
    
    this.client.on('connect', () => {
      console.log('✅ Conectado a MQTT via WebSocket');
      this.client.subscribe('hospital/huellas');
    });
    
    this.client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      console.log('📨 MQTT:', data);
      
      Object.values(this.callbacks).forEach(cb => cb(data));
    });
  }

  publicar(topic, mensaje) {
    if (this.client) {
      this.client.publish(topic, JSON.stringify(mensaje));
    }
  }

  enviarComando(comando, userId = null) {
    const cmd = { comando };
    if (userId) cmd.user_id = userId;
    this.publicar('hospital/comandos', cmd);
  }

  onMensaje(callback, id) {
    this.callbacks[id] = callback;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}

export default new MqttService();