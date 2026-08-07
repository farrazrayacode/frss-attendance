import { api } from '$lib/axios';
import type { MonitoringFeed } from '$lib/interfaces/monitoring.interfaces';
import type { CameraData } from '$lib/interfaces/camera.interfaces';

export const getAllCameras = async (
	search: string = '',
	locationFilter: string = '',
	statusFilter: 'Online' | 'Offline' | '' = ''
): Promise<CameraData[]> => {
	try {
		const params = new URLSearchParams();
		if (search) params.append('search', search);
		if (locationFilter) params.append('locationFilter', locationFilter);
		if (statusFilter) params.append('statusFilter', statusFilter);

		const queryString = params.toString();
		const url = `/monitoring/cameras${queryString ? `?${queryString}` : ''}`;

		const res = await api.get(url);
		return res.data.data;
	} catch (error) {
		console.error('Failed to fetch camera data:', error);
		return [];
	}
};

export const getMonitoringLocations = async (): Promise<MonitoringFeed[]> => {
	try {
		const res = await api.get('/monitoring');
		return res.data.data;
	} catch (error) {
		console.error('Failed to fetch monitoring locations:', error);
		return [];
	}
};

export const createCamera = async (payload: {
	name: string;
	streamUrl: string;
	location?: string;
	ipAddress?: string;
}): Promise<CameraData> => {
	try {
		const response = await api.post('/monitoring/cameras', payload);
		return response.data.data;
	} catch (error) {
		console.error('Failed to create camera:', error);
		throw error;
	}
};

export const updateCamera = async (
	id: number,
	payload: Partial<{ name: string; streamUrl: string; location: string; ipAddress: string }>
): Promise<CameraData> => {
	try {
		const response = await api.put(`/monitoring/cameras/${id}`, payload);
		return response.data.data;
	} catch (error) {
		console.error('Failed to update camera:', error);
		throw error;
	}
};

export const deleteCamera = async (id: number): Promise<void> => {
	try {
		await api.delete(`/monitoring/cameras/${id}`);
	} catch (error) {
		console.error('Failed to delete camera:', error);
		throw error;
	}
};
