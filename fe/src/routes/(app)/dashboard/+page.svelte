<script lang="ts">
    import { AlertCircle, Camera, UserCheck, UserX } from '@lucide/svelte';
    import Breadcrumb from '../../../components/breadcrumb/Breadcrumb.svelte';
    import { renderChart } from 'svelte-chart-apex';
    import type { DashboardResponse, SystemHealthData } from '$lib/interfaces/dashboard.interfaces';
    import { formatDistanceToNow } from 'date-fns';

    // Import Firebase Instance & Functions
    import { rtdb1 } from '$lib/firebase';
    import { ref, onValue } from 'firebase/database';

    // State Variables (Svelte 5 Runes)
    let dashboardData = $state<DashboardResponse | null>(null);
    let isLoading = $state(true);
    let activeTimeframe = $state<'today' | 'weekly' | 'monthly'>('today');

    function setTimeframe(period: 'today' | 'weekly' | 'monthly') {
        activeTimeframe = period;
    }

    // Subscribe Realtime Data dari Firebase
    $effect(() => {
        const dashboardRef = ref(rtdb1, 'dashboard');

        const unsubscribe = onValue(
            dashboardRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    dashboardData = snapshot.val() as DashboardResponse;
                } else {
                    dashboardData = null;
                }
                isLoading = false;
            },
            (error) => {
                console.error("Failed to fetch dashboard data from Firebase:", error);
                dashboardData = null;
                isLoading = false;
            }
        );

        return () => unsubscribe();
    });

    // Derived Charts Data (Svelte 5 Runes)
    const cameraStatusChartData = $derived(
        dashboardData?.charts?.cameraStatus || {
            options: {
                chart: { type: 'donut' as const },
                labels: ['Online', 'Offline', 'Maintenance'],
                colors: ['#10B981', '#EF4444', '#F59E0B'],
                noData: { text: 'No camera data available' },
                legend: {
                    position: 'bottom' as const,
                    horizontalAlign: 'center' as const
                }
            },
            series: dashboardData?.charts?.cameraStatus?.series || [0, 0, 0]
        }
    );

    const activityTimelineChartData = $derived(
        dashboardData?.charts?.securityIncidents || {
            options: {
                chart: { type: 'line' as const, toolbar: { show: false } },
                series: [{ name: 'Events', data: [0, 0, 0, 0, 0] }],
                xaxis: { categories: ['08:00', '10:00', '12:00', '14:00', '16:00'] },
                noData: { text: 'No activity data available' },
                legend: {
                    position: 'top' as const,
                    horizontalAlign: 'left' as const
                }
            }
        }
    );

    // Helper untuk menangani warna pada Progress Bar System Health
    function getHealthColor(color: string): string {
        if (!color) return '#3B82F6';
        if (color.startsWith('#') || color.startsWith('rgb')) return color;
        
        const colorMap: Record<string, string> = {
            brand: '#4F46E5',
            primary: '#3B82F6',
            success: '#10B981',
            error: '#EF4444',
            danger: '#EF4444',
            warning: '#F59E0B',
            info: '#06B6D4'
        };
        return colorMap[color] || color;
    }
</script>

<div class="flex flex-col gap-y-6">
    <Breadcrumb pageName="Dashboard" />

    <!-- Dashboard Stats -->
    <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {#if isLoading}
            <div class="col-span-full py-4 text-center text-gray-500 dark:text-gray-400">Loading stats...</div>
        {:else if dashboardData?.stats}
            <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex items-center gap-x-4">
                    <div class="bg-brand-500 flex h-14 w-14 items-center justify-center rounded-lg">
                        <Camera class="h-6 w-6 text-white" />
                    </div>
                    <div class="flex flex-col">
                        <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{dashboardData.stats.totalCameras ?? 0}</p>
                        <p class="text-theme-sm text-gray-500 dark:text-white/70">Total Cameras</p>
                    </div>
                </div>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex items-center gap-x-4">
                    <div class="bg-success-500 flex h-14 w-14 items-center justify-center rounded-lg">
                        <UserCheck class="h-6 w-6 text-white" />
                    </div>
                    <div class="flex flex-col">
                        <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{dashboardData.stats.attendancesToday ?? 0}</p>
                        <p class="text-theme-sm text-gray-500 dark:text-white/70">Attendances Today</p>
                    </div>
                </div>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex items-center gap-x-4">
                    <div class="bg-error-500 flex h-14 w-14 items-center justify-center rounded-lg">
                        <AlertCircle class="h-6 w-6 text-white" />
                    </div>
                    <div class="flex flex-col">
                        <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{dashboardData.stats.alertsToday ?? 0}</p>
                        <p class="text-theme-sm text-gray-500 dark:text-white/70">Alerts Today</p>
                    </div>
                </div>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex items-center gap-x-4">
                    <div class="bg-brand-500 flex h-14 w-14 items-center justify-center rounded-lg">
                        <UserX class="h-6 w-6 text-white" />
                    </div>
                    <div class="flex flex-col">
                        <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{dashboardData.stats.blacklistDetections ?? 0}</p>
                        <p class="text-theme-sm text-gray-500 dark:text-white/70">Blacklist Detection</p>
                    </div>
                </div>
            </div>
        {:else}
            <div class="col-span-full py-4 text-center text-gray-500 dark:text-gray-400">Failed to load dashboard data.</div>
        {/if}
    </div>

    <!-- Chart Section -->
    <div class="grid grid-cols-12 gap-4">
        <!-- Activity Timeline Chart -->
        <div class="col-span-full rounded-2xl border border-gray-200 bg-white md:col-span-6 lg:col-span-7 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
                <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
                    Activity Timeline
                </h3>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
                    <button 
                        class="btn-secondary-outline-md {activeTimeframe === 'today' ? '!bg-brand-500 !text-white' : ''}" 
                        aria-label="tabButton"
                        onclick={() => setTimeframe('today')}
                    > 
                        Today 
                    </button>
                    <button 
                        class="btn-secondary-outline-md {activeTimeframe === 'weekly' ? '!bg-brand-500 !text-white' : ''}" 
                        aria-label="tabButton"
                        onclick={() => setTimeframe('weekly')}
                    > 
                        Weekly 
                    </button>
                    <button 
                        class="btn-secondary-outline-md {activeTimeframe === 'monthly' ? '!bg-brand-500 !text-white' : ''}" 
                        aria-label="tabButton"
                        onclick={() => setTimeframe('monthly')}
                    > 
                        Monthly 
                    </button>
                </div>
            </div>
            <div use:renderChart={activityTimelineChartData}></div>
        </div>

        <!-- Camera Status Chart -->
        <div class="col-span-full rounded-2xl border border-gray-200 bg-white md:col-span-6 lg:col-span-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
                <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
                    Camera Status
                </h3>
            </div>
            <div use:renderChart={cameraStatusChartData}></div>
        </div>
    </div>

    <!-- Recent Events & System Health Section -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Recent Events Table -->
        <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
                <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Recent Events</h3>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
                    <a href="/alert-notification" class="btn-secondary-outline-md" aria-label="tabButton">
                        View All
                    </a>
                </div>
            </div>
            
            <div class="max-w-full overflow-x-auto px-6 py-5">
                <table class="min-w-full">
                    <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                        <tr>
                            <th class="px-5 py-3 sm:px-6 text-left">
                                <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</p>
                            </th>
                            <th class="px-5 py-3 sm:px-6 text-left">
                                <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</p>
                            </th>
                            <th class="px-5 py-3 sm:px-6 text-left">
                                <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Location</p>
                            </th>
                            <th class="px-5 py-3 sm:px-6 text-left">
                                <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Time</p>
                            </th>
                            <th class="px-5 py-3 sm:px-6 text-left">
                                <p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        {#if dashboardData && dashboardData.recentAlerts && dashboardData.recentAlerts.length > 0}
                            {#each dashboardData.recentAlerts.slice(0, 5) as event, index}
                                <tr>
                                    <td class="px-5 py-4 sm:px-6">
                                        <p class="text-theme-sm text-gray-500 dark:text-gray-400">
                                            {index + 1}
                                        </p>
                                    </td>
                                    <td class="px-5 py-4 sm:px-6">
                                        <p class="text-theme-sm text-gray-500 dark:text-gray-400">
                                            {event.title}
                                        </p>
                                    </td>
                                    <td class="px-5 py-4 sm:px-6">
                                        <p class="text-theme-sm text-gray-500 dark:text-gray-400">
                                            {event.location}
                                        </p>
                                    </td>
                                    <td class="px-5 py-4 sm:px-6">
                                        <p class="text-theme-sm text-gray-500 dark:text-gray-400">
                                            {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }) : '-'}
                                        </p>
                                    </td>
                                    <td class="px-5 py-4 sm:px-6">
                                        <p class={`text-theme-sm ${event.isResolved ? 'text-success-500' : 'text-error-500'}`}>
                                            {event.isResolved ? 'Resolved' : 'Pending'}
                                        </p>
                                    </td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No recent events found.
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- System Health Progress Bars -->
        <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
                <h3 class="text-base font-medium text-gray-800 dark:text-white/90">System Health</h3>
            </div>
            <div class="px-6 py-5">
                <div class="flex flex-col gap-y-4">
                    {#if dashboardData && dashboardData.systemHealth && dashboardData.systemHealth.length > 0}
                        {#each dashboardData.systemHealth as health}
                            <div class="flex flex-col gap-y-3">
                                <div class="flex items-center justify-between">
                                    <p class="text-theme-md font-medium text-gray-800 dark:text-white">{health.label}</p>
                                    <p class="text-theme-sm text-gray-800 dark:text-white">{health.percentage}%</p>
                                </div>
                                <div class="relative h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    <div
                                        class="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                                        style="width: {health.percentage}%; background-color: {getHealthColor(health.color)};"
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="py-4 text-center text-gray-500 dark:text-gray-400">Failed to load system health data.</div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>