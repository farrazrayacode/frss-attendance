import axios from 'axios';
import { env } from '$env/dynamic/public';

export const api = axios.create({
    baseURL: env.PUBLIC_API_URL || 'http://localhost:3000/api'
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                // Pastikan format header Auth sesuai kebutuhan backend (misal pakai 'Bearer ' atau token saja)
                config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            }
        }

        config.headers['Cache-Control'] = 'no-cache';
        config.headers['Pragma'] = 'no-cache';
        config.headers['If-Modified-Since'] = '0';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            // Cek HANYA jika error 401 (Unauthorized / Token Invalid/Expired)
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('accessToken');
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
);