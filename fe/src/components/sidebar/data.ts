import {
	LayoutDashboard,
	Video,
	Camera,
	Users,
	FileBarChart,
	BellRing,
	Film,
	Egg
} from 'lucide-svelte';

export interface MenuItem {
	title: string;
	href: string;
	icon: any;
	badge?: string;
}

export const mainMenuItems: MenuItem[] = [
	{
		title: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard
	},
	{
		title: 'Live Monitoring',
		href: '/live-monitoring',
		icon: Video
	},
	{
		title: 'Camera Management',
		href: '/camera',
		icon: Camera
	},
	{
		title: 'Video Playback',
		href: '/video-playback',
		icon: Film
	},
	{
		title: 'Report Analytics',
		href: '/report-analytics',
		icon: FileBarChart
	},
	{
		title: 'Alert Notification',
		href: '/alert-notification',
		icon: BellRing
	}
];

export const masterMenuItems: MenuItem[] = [
	{
		title: 'User Management',
		href: '/user',
		icon: Users
	}
];

// Dikosongkan agar menu chicken counting tidak muncul jika tidak digunakan
export const poultryMenuItems: MenuItem[] = [];

export const singleMenuItems: MenuItem[] = [];
