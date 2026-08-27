import axios from 'axios';
import { env } from '$env/dynamic/public';

// Setup Base URL Backend 1 & Backend 2 dengan fallback localhost
const BE1_BASE = env.PUBLIC_BE_URL || env.PUBLIC_API_URL || 'http://localhost:3000';
const BE2_BASE = env.PUBLIC_BE2_URL || 'http://localhost:5000';

// Instance Axios Backend 1
export const api = axios.create({
    baseURL: BE1_BASE.endsWith('/api') ? BE1_BASE : `${BE1_BASE}/api`
});

// Instance Axios Backend 2
export const api2 = axios.create({
    baseURL: BE2_BASE.endsWith('/api') ? BE2_BASE : `${BE2_BASE}/api`
});

// Helper Interceptor biar gak koding ulang di kedua instance
const setupInterceptors = (instance: typeof api) => {
    instance.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                }
            }

            config.headers['Cache-Control'] = 'no-cache';
            config.headers['Pragma'] = 'no-cache';
            config.headers['If-Modified-Since'] = '0';

            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (typeof window !== 'undefined') {
                // Kick ke signin CUMA kalo benar-benar 401 Unauthenticated
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('accessToken');
                    window.location.href = '/signin';
                }
            }
            return Promise.reject(error);
        }
    );
};

// Pasang interceptor ke dua-duanya
setupInterceptors(api);
setupInterceptors(api2);