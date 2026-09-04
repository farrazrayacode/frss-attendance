import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

// Matikan SSR untuk route group (app) jika backend terpisah (SPA Client-Side Rendering)
export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async () => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

		// Jika token tidak ada, redirect otomatis ke halaman Sign In
		if (!token) {
			throw redirect(307, '/signin');
		}
	}

	return {};
};
