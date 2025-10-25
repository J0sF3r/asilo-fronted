// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://asilo-backend-api.onrender.com/api'
});

/*const api = axios.create({
    baseURL: 'https://asilo-backend-api.onrender.com/api' ,
    headers: {
        'Content-Type': 'application/json'
    }
});*/

// Se ejecuta antes de cada solicitud para añadir el token.
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
