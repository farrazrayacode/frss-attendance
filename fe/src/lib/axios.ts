import axios from 'axios';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
	headers: {
		'Content-Type': 'application/json'
	}
});

// Interceptor untuk otomatis menyematkan token JWT
api.interceptors.request.use(
	(config) => {
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token.replace('Bearer ', '')}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default api;
