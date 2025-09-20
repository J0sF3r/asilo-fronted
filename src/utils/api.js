// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://asilo-backend-api.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

// ESTA PARTE ES LA MÁS IMPORTANTE
// Se ejecuta ANTES de cada solicitud para añadir el token.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;