<script lang="ts">
    import { onMount } from 'svelte';
    import { createQuery } from '@tanstack/svelte-query';
    import { ChevronDown, ChevronLeft, ChevronRight, Download, FileText, RefreshCcw } from '@lucide/svelte';
    import Breadcrumb from '../../../components/breadcrumb/Breadcrumb.svelte';
    import { getAttendanceReport, getMonitoringLocationsForReports } from './api';
    import type { AttendanceReportData } from '$lib/interfaces/report.interfaces';
    import { renderChart } from 'svelte-chart-apex';
    import { incidentsChartData, securityIncidentsChartData } from './charts'; 

    // Filter States
    let selectedReportType: string = $state('');
    let selectedLocationFilter: string = $state('');
    let selectedDateRange: string = $state('');
    let selectedTimeFrame: 'Daily' | 'Weekly' | 'Monthly' = $state('Daily');

    // Data States
    let attendanceReportData: AttendanceReportData[] = $state([]);
    let isLoadingReport = $state(false);

    // TanStack Query untuk Lokasi
    const locationsQuery = createQuery({
        queryKey: ['reportLocations'],
        queryFn: () => getMonitoringLocationsForReports()
    });

    async function loadAttendanceReport() {
        isLoadingReport = true;
        try {
            const report = await getAttendanceReport(
                selectedLocationFilter,
                selectedDateRange
            );
            attendanceReportData = report;
        } catch (error) {
            console.error('Failed to load attendance report:', error);
            attendanceReportData = [];
        } finally {
            isLoadingReport = false;
        }
    }

    async function generateReport() {
        await loadAttendanceReport(); 
    }

    async function resetReportFilters() {
        selectedReportType = '';
        selectedLocationFilter = '';
        selectedDateRange = '';
        await loadAttendanceReport();
    }

    onMount(async () => {
        await loadAttendanceReport(); 
    });
</script>

<div class="flex flex-col gap-y-6">
    <Breadcrumb pageName="Report & Analytics" />

    <!-- Report Filters -->
    <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
            <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Report Filters</h3>
        </div>
        <div class="flex flex-col gap-y-6 px-6 py-5">
            <div class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
                <!-- Report Type -->
                <div class="form-groups">
                    <span class="form-label">Report Type</span>
                    <div class="relative z-20 bg-transparent">
                        <select bind:value={selectedReportType} class="select-input">
                            <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                            {#each ['Security Incident', 'Attendance', 'Traffic Analysis', 'System Performance'] as option}
                                <option value={option} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                    {option}
                                </option>
                            {/each}
                        </select>
                        <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            <ChevronDown class="h-5 w-5" />
                        </span>
                    </div>
                </div>

                <!-- Location -->
                <div class="form-groups">
                    <span class="form-label">Location</span>
                    <div class="relative z-20 bg-transparent">
                        <select bind:value={selectedLocationFilter} class="select-input">
                            <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                            {#each $locationsQuery.data || [] as option}
                                <option value={option.location} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                    {option.location}
                                </option>
                            {/each}
                        </select>
                        <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            <ChevronDown class="h-5 w-5" />
                        </span>
                    </div>
                </div>

                <!-- Date Range -->
                <div class="form-groups">
                    <span class="form-label">Date Range</span>
                    <div class="relative z-20 bg-transparent">
                        <select bind:value={selectedDateRange} class="select-input">
                            <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                            {#each ['Last 7 Days', 'Last 14 Days', 'Last 30 Days'] as option}
                                <option value={option} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                    {option}
                                </option>
                            {/each}
                        </select>
                        <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            <ChevronDown class="h-5 w-5" />
                        </span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-x-2">
                <button aria-label="generateReportButton" class="btn-primary-md" onclick={generateReport}>
                    <RefreshCcw class="h-4 w-4" />
                    Generate Report
                </button>
                <button aria-label="exportReportButton" class="btn-primary-outline-md">
                    <Download class="h-4 w-4" />
                    Export
                </button>
            </div>
        </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-12 gap-4">
        <!-- Chart Security Incidents -->
        <div class="col-span-full rounded-2xl border border-gray-200 bg-white md:col-span-6 lg:col-span-7 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
                <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
                    Security Incidents by Type
                </h3>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
                    {#each (['Daily', 'Weekly', 'Monthly'] as const) as tf}
                        <button 
                            class={selectedTimeFrame === tf ? "btn-primary-md py-1 px-3 text-xs" : "btn-secondary-outline-md py-1 px-3 text-xs"}
                            onclick={() => selectedTimeFrame = tf}
                            aria-label={`Select ${tf} view`}
                        >
                            {tf}
                        </button>
                    {/each}
                </div>
            </div>
            <div use:renderChart={securityIncidentsChartData}></div>
        </div>

        <!-- Chart Incidents by Location -->
        <div class="col-span-full rounded-2xl border border-gray-200 bg-white md:col-span-6 lg:col-span-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
                <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
                    Incidents by Location
                </h3>
            </div>
            <div use:renderChart={incidentsChartData}></div>
        </div>
    </div>

    <!-- Attendance Report Table -->
    <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
            <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Attendance Report</h3>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
                <button class="btn-secondary-outline-md" aria-label="downloadCsvButton">
                    <Download class="h-4 w-4" />
                    Export CSV
                </button>
                <button class="btn-secondary-outline-md" aria-label="downloadPdfButton">
                    <FileText class="h-4 w-4" />
                    Export PDF
                </button>
            </div>
        </div>
        
        <div class="flex flex-col gap-y-4 px-6 py-5 lg:gap-y-6">
            <!-- Table -->
            <div class="max-w-full overflow-x-auto">
                <table class="min-w-full">
                    <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                        <tr>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">ID</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Department</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Check In</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Check Out</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Duration</p></th>
                            <th class="px-5 py-3 sm:px-6 text-left"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</p></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        {#if isLoadingReport}
                            <tr>
                                <td colspan="8" class="p-4 text-center text-gray-500 dark:text-gray-400">Loading attendance report...</td>
                            </tr>
                        {:else if attendanceReportData.length === 0}
                            <tr>
                                <td colspan="8" class="p-4 text-center text-gray-500 dark:text-gray-400">No attendance data found.</td>
                            </tr>
                        {:else}
                            {#each attendanceReportData as attendance, index}
                                <tr>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.id.substring(0, 8)}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.name}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.department}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.checkIn}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.checkOut}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.duration}</p></td>
                                    <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{attendance.status}</p></td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex flex-col items-center gap-y-4 lg:flex-row lg:justify-between">
                <span class="text-theme-sm text-gray-500 dark:text-gray-400">
                    Showing 1 to {Math.min(10, attendanceReportData.length)} of {attendanceReportData.length} entries
                </span>
                <div class="flex items-center gap-x-3">
                    <button aria-label="previousButton" class="btn-secondary-icon">
                        <ChevronLeft class="h-5 w-5" />
                    </button>
                    <div class="flex items-center gap-x-1">
                        <button aria-label="pageButton" class="pagination-page text-brand-500 bg-blue-500/[0.08]">1</button>
                        <button aria-label="pageButton" class="pagination-page">2</button>
                    </div>
                    <button aria-label="nextButton" class="btn-secondary-icon">
                        <ChevronRight class="h-5 w-5" />
                    </button>
                </div>
                <div class="flex items-center gap-x-2">
                    <span class="text-theme-sm text-gray-500 dark:text-gray-400">rows per page</span>
                    <div class="relative z-20 bg-transparent">
                        <select class="select-input">
                            {#each ['10', '20', '30', '40', '50'] as perRows}
                                <option value={perRows} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                    {perRows}
                                </option>
                            {/each}
                        </select>
                        <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            <ChevronDown class="h-5 w-5" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Activity Heatmap -->
    <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
            <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Activity Heatmap</h3>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
                <div class="relative z-20 bg-transparent">
                    <select class="select-input">
                        <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                        {#each ['Motion Density', 'Crowd Density', 'Unusual Behaviour'] as option}
                            <option value={option} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                {option}
                            </option>
                        {/each}
                    </select>
                    <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <ChevronDown class="h-5 w-5" />
                    </span>
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-y-6 px-6 py-5">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div class="flex flex-col gap-y-2">
                    <p class="text-theme-md font-medium text-gray-800 dark:text-white/90">Front Gate</p>
                    <div class="relative h-52 w-full overflow-hidden rounded-xl bg-gray-800">
                        <div
                            class="absolute top-0 right-0 bottom-0 left-0"
                            style="background: linear-gradient(135deg, rgba(255,0,0,0.5) 0%, rgba(0,0,0,0) 70%);"
                        ></div>
                    </div>
                </div>
                <div class="flex flex-col gap-y-2">
                    <p class="text-theme-md font-medium text-gray-800 dark:text-white/90">Lobby</p>
                    <div class="relative h-52 w-full overflow-hidden rounded-xl bg-gray-800">
                        <div
                            class="absolute top-0 right-0 bottom-0 left-0"
                            style="background: radial-gradient(circle at center, rgba(255,0,0,0.7) 0%, rgba(0,0,0,0) 70%);"
                        ></div>
                    </div>
                </div>
                <div class="flex flex-col gap-y-2">
                    <p class="text-theme-md font-medium text-gray-800 dark:text-white/90">Parking Lot</p>
                    <div class="relative h-52 w-full overflow-hidden rounded-xl bg-gray-800">
                        <div
                            class="absolute top-0 right-0 bottom-0 left-0"
                            style="background: linear-gradient(90deg, rgba(255,0,0,0.6) 0%, rgba(0,0,0,0) 100%);"
                        ></div>
                    </div>
                </div>
            </div>
            <div class="mx-auto flex w-full items-center gap-x-4 md:w-72">
                <span class="text-theme-sm text-gray-800 dark:text-gray-300">Low</span>
                <div
                    class="h-3 flex-1 rounded"
                    style="background: linear-gradient(to right, rgba(0,255,0,0.5), rgba(255,255,0,0.5), rgba(255,0,0,0.5));"
                ></div>
                <span class="text-theme-sm text-gray-800 dark:text-gray-300">High</span>
            </div>
        </div>
    </div>
</div>