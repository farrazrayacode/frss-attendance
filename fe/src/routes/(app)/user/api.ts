import { api } from '$lib/axios';
import type { User } from '$lib/interfaces/user.interfaces';
import type { Role } from '$lib/interfaces/role.interfaces';

export const getAllUsers = async (
	search: string = '',
	roleFilter: string = '',
	statusFilter: 'Online' | 'Offline' | '' = '',
	approvalFilter: 'Approved' | 'Pending' | '' = ''
): Promise<User[]> => {
	try {
		const params = new URLSearchParams();
		if (search) params.append('search', search);
		if (roleFilter) params.append('roleFilter', roleFilter);
		if (statusFilter) params.append('statusFilter', statusFilter);
		if (approvalFilter) params.append('approvalFilter', approvalFilter);

		const queryString = params.toString();
		const url = `/users${queryString ? `?${queryString}` : ''}`;

		const response = await api.get(url);
		return response.data.data;
	} catch (error) {
		console.error('Failed to fetch users:', error);
		throw error;
	}
};

export const getAllRoles = async (): Promise<Role[]> => {
	try {
		const response = await api.get(`/roles`);
		return response.data.data;
	} catch (error) {
		console.error('Failed to fetch roles:', error);
		throw error;
	}
};

export const approveUser = async (userId: string): Promise<void> => {
	try {
		await api.patch(`/users/${userId}/approve`);
	} catch (error) {
		console.error(`Failed to approve user ${userId}:`, error);
		throw error;
	}
};

export const rejectUser = async (userId: string): Promise<void> => {
	try {
		await api.patch(`/users/${userId}/reject`);
	} catch (error) {
		console.error(`Failed to reject user ${userId}:`, error);
		throw error;
	}
};

export const deleteUser = async (userId: string): Promise<void> => {
	try {
		await api.delete(`/users/${userId}`);
	} catch (error) {
		console.error(`Failed to delete user ${userId}:`, error);
		throw error;
	}
};

export const updateUser = async (userId: string, payload: object): Promise<User> => {
	try {
		const response = await api.put(`/users/${userId}`, payload);
		return response.data.data;
	} catch (error) {
		console.error(`Failed to update user ${userId}:`, error);
		throw error;
	}
};

export const resetUserPassword = async (userId: string): Promise<{ tempPassword: string }> => {
	try {
		const response = await api.post(`/users/${userId}/reset-password`);
		return response.data.data;
	} catch (error) {
		console.error(`Failed to reset password for user ${userId}:`, error);
		throw error;
	}
};

export const createUser = async (payload: {
	email: string;
	name?: string;
	username?: string;
	password: string;
	roleId?: string | number | null;
	department?: string;
}): Promise<User> => {
	try {
		const response = await api.post(`/users`, payload);
		return response.data.data;
	} catch (error) {
		console.error('Failed to create user:', error);
		throw error;
	}
};

export const createRole = async (payload: {
	name: string;
	description: string;
	permissions: string[];
}): Promise<Role> => {
	try {
		const response = await api.post(`/roles`, payload);
		return response.data.data;
	} catch (error) {
		console.error('Failed to create role:', error);
		throw error;
	}
};

export const updateRole = async (
	roleId: string | number,
	payload: { name?: string; description?: string; permissions?: string[] }
): Promise<Role> => {
	try {
		const response = await api.put(`/roles/${roleId}`, payload);
		return response.data.data;
	} catch (error) {
		console.error(`Failed to update role ${roleId}:`, error);
		throw error;
	}
};

export const deleteRole = async (roleId: string | number): Promise<void> => {
	try {
		await api.delete(`/roles/${roleId}`);
	} catch (error) {
		console.error(`Failed to delete role ${roleId}:`, error);
		throw error;
	}
};
