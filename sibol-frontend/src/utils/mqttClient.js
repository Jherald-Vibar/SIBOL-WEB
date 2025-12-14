import mqtt from 'mqtt';

let client = null;

const MQTT_CONFIG = {
  // HiveMQ Cloud Cluster
  broker: 'wss://8c33605f8fe843f0a8bc3deca5d34911.s1.eu.hivemq.cloud:8884/mqtt',

  username: 'Sibol',  // Replace with your HiveMQ username
  password: '0529100804Miii',  // Replace with your HiveMQ password

  options: {
    keepalive: 60,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 30000,
    protocol: 'wss',
    protocolVersion: 5  // MQTT 5.0
  }
};

export const connectMQTT = (clientId, callbacks = {}) => {
  const { onConnect, onError, onMessage, onOffline } = callbacks;

  const fullOptions = {
    ...MQTT_CONFIG.options,
    clientId: clientId || `cropcare_${Math.random().toString(16).substr(2, 8)}`,
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
  };

  console.log('🔌 Connecting to HiveMQ Cloud...', MQTT_CONFIG.broker);
  client = mqtt.connect(MQTT_CONFIG.broker, fullOptions);

  client.on('connect', () => {
    console.log('✅ MQTT Connected to HiveMQ Cloud successfully');
    if (onConnect) onConnect();
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Error:', error.message);
    if (onError) onError(error);
  });

  client.on('offline', () => {
    console.log('📡 MQTT Offline');
    if (onOffline) onOffline();
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT Reconnecting...');
  });

  client.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log('📨 Message received:', topic, payload);
      if (onMessage) onMessage(topic, payload);
    } catch (e) {
      console.log('📨 Message received (raw):', topic, message.toString());
      if (onMessage) onMessage(topic, message.toString());
    }
  });

  return client;
};

export const disconnectMQTT = () => {
  if (client) {
    client.end(true);
    client = null;
    console.log('🔌 MQTT Disconnected');
  }
};

export const publishMessage = (topic, message) => {
  return new Promise((resolve, reject) => {
    if (!client || !client.connected) {
      reject(new Error('MQTT not connected'));
      return;
    }

    const payload = typeof message === 'object' ? JSON.stringify(message) : message;

    client.publish(topic, payload, { qos: 1, retain: false }, (error) => {
      if (error) {
        console.error('❌ Publish failed:', error);
        reject(error);
      } else {
        console.log('✅ Published to', topic, ':', message);
        resolve();
      }
    });
  });
};

export const subscribe = (topic) => {
  return new Promise((resolve, reject) => {
    if (!client || !client.connected) {
      reject(new Error('MQTT not connected'));
      return;
    }

    client.subscribe(topic, { qos: 1 }, (error) => {
      if (error) {
        console.error('❌ Subscribe failed:', error);
        reject(error);
      } else {
        console.log('✅ Subscribed to:', topic);
        resolve();
      }
    });
  });
};

export const unsubscribe = (topic) => {
  if (client && client.connected) {
    client.unsubscribe(topic);
    console.log('✅ Unsubscribed from:', topic);
  }
};

export const isConnected = () => client && client.connected;
