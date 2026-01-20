// frontend/config/config.js

const environments = {
  local: 'http://192.168.1.5:5000',
  development: 'https://stockit-i82e.onrender.com',
  production: 'https://stockit-i82e.onrender.com',
};

const config = {
  // Cambio crítico para builds de producción
  API_URL: (() => {
    // En desarrollo con Expo
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      //return environments.local;
      return environments.development;
    }
    // En builds de producción
    return environments.production;
  })(),
  
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const getApiUrl = (endpoint) => {
  return `${config.API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export const getCurrentEnvironment = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'development';
  }
  return 'production';
};

console.log(`App corriendo en modo: ${getCurrentEnvironment()}`);
console.log(`API URL: ${config.API_URL}`);

export default config;