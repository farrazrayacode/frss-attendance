<script lang="ts">
    import { onMount } from 'svelte';
    import {
        AlertTriangle,
        Camera,
        ChevronDown,
        ChevronFirst,
        ChevronLast,
        ChevronLeft,
        ChevronRight,
        Download,
        Filter,
        Footprints,
        Maximize,
        Pause,
        Play,
        User,
        Volume2,
        VolumeX
    } from '@lucide/svelte';
    import Breadcrumb from '../../../components/breadcrumb/Breadcrumb.svelte';
    import { slide } from 'svelte/transition';
    import { getRecordingList, getCamerasForPlayback } from './api';
    import type { RecordingData } from '$lib/interfaces/recording.interfaces';
    import type { MonitoringFeed } from '$lib/interfaces/monitoring.interfaces';

    // State Variables
    let openRecordingFilters = $state(false);
    let searchPerson = $state('');
    let selectedCamera = $state('');
    let selectedDate = $state<string | null>(null);

    let recordingData: RecordingData[] = $state([]);
    let cameras: MonitoringFeed[] = $state([]);
    let isLoading = $state(false);

    let activeRecording = $state<RecordingData | null>(null);
    let videoPlayer = $state<HTMLVideoElement | null>(null);

    // Player State
    let isPlaying = $state(false);
    let isMuted = $state(true);

    // Helper Formatting
    function formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Data Loaders
    async function loadRecordingList() {
        isLoading = true;
        try {
            const dateObj = selectedDate ? new Date(selectedDate) : null;
            const recordings = await getRecordingList(searchPerson, selectedCamera, dateObj);
            recordingData = recordings.map((rec) => ({
                ...rec,
                startTime: new Date(rec.startTime),
                endTime: new Date(rec.endTime)
            }));

            if (recordingData.length > 0) {
                activeRecording = recordingData[0];
            } else {
                activeRecording = null;
            }
        } catch (error) {
            console.error('Failed to load recording list:', error);
            recordingData = [];
        } finally {
            isLoading = false;
        }
    }

    async function loadCameras() {
        try {
            const cameraFeeds = await getCamerasForPlayback();
            cameras = cameraFeeds;
        } catch (error) {
            console.error('Failed to load cameras for playback:', error);
            cameras = [];
        }
    }

    // Handlers
    function playRecording(recording: RecordingData) {
        activeRecording = recording;
        isPlaying = true;
        if (videoPlayer) {
            videoPlayer.play();
        }
    }

    function applyFilters() {
        openRecordingFilters = false;
        loadRecordingList();
    }

    function resetFilters() {
        searchPerson = '';
        selectedCamera = '';
        selectedDate = null;
        openRecordingFilters = false;
        loadRecordingList();
    }

    // Video Controls
    function togglePlay() {
        if (!videoPlayer) return;
        if (videoPlayer.paused) {
            videoPlayer.play();
            isPlaying = true;
        } else {
            videoPlayer.pause();
            isPlaying = false;
        }
    }

    function toggleMute() {
        if (!videoPlayer) return;
        videoPlayer.muted = !videoPlayer.muted;
        isMuted = videoPlayer.muted;
    }

    function toggleFullscreen() {
        if (!videoPlayer) return;
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        }
    }

    function takeSnapshot() {
        if (!videoPlayer) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoPlayer.videoWidth || 1280;
        canvas.height = videoPlayer.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = image;
            a.download = `snapshot-${Date.now()}.png`;
            a.click();
        }
    }

    function downloadCurrentVideo() {
        if (!activeRecording) return;
        const url = activeRecording.filePath || activeRecording.camera?.streamUrl;
        if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${activeRecording.id || 'video'}.mp4`;
            a.click();
        }
    }

    onMount(async () => {
        await loadCameras();
        await loadRecordingList();
    });
</script>

<div class="flex flex-col gap-y-6">
    <Breadcrumb pageName="Video Playback" />

    <!-- Video Playback Section -->
    <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
            <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Video Playback</h3>
            <div class="flex flex-wrap items-center gap-2">
                <button 
                    onclick={downloadCurrentVideo} 
                    disabled={!activeRecording} 
                    class="btn-secondary-outline-md disabled:opacity-50" 
                    aria-label="Download Video"
                >
                    <Download class="h-4 w-4" />
                    Download
                </button>
                <button 
                    onclick={takeSnapshot} 
                    disabled={!activeRecording} 
                    class="btn-secondary-outline-md disabled:opacity-50" 
                    aria-label="Take Snapshot"
                >
                    <Camera class="h-4 w-4" />
                    Snapshot
                </button>
                <button 
                    onclick={toggleFullscreen} 
                    disabled={!activeRecording} 
                    class="btn-secondary-outline-md disabled:opacity-50" 
                    aria-label="Toggle Fullscreen"
                >
                    <Maximize class="h-4 w-4" />
                    Fullscreen
                </button>
            </div>
        </div>

        <div class="flex flex-col gap-y-8 px-6 py-5">
            <div class="relative h-96 w-full overflow-hidden rounded-lg bg-black">
                {#if activeRecording}
                    <video
                        bind:this={videoPlayer}
                        src={activeRecording.filePath || activeRecording.camera?.streamUrl}
                        controls={false}
                        autoplay
                        muted={isMuted}
                        playsinline
                        class="h-full w-full object-contain"
                        onplay={() => (isPlaying = true)}
                        onpause={() => (isPlaying = false)}
                    ></video>

                    <!-- Control Overlay Bar (At Bottom) -->
                    <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                        <div class="flex flex-col gap-y-3">
                            <p class="text-sm font-medium text-white shadow-sm">
                                {activeRecording.camera?.name || 'Camera Feed'} - 
                                {formatDate(activeRecording.startTime)} {formatTime(activeRecording.startTime)}
                            </p>
                            <div class="flex items-center gap-x-4">
                                <div class="flex items-center gap-x-1">
                                    <button onclick={togglePlay} class="btn-secondary-icon text-white hover:text-brand-500" aria-label="Play/Pause">
                                        {#if isPlaying}
                                            <Pause class="h-4 w-4" />
                                        {:else}
                                            <Play class="h-4 w-4" />
                                        {/if}
                                    </button>
                                </div>
                                <div class="flex flex-1 items-center gap-x-2">
                                    <span class="text-xs text-white/80">{formatTime(activeRecording.startTime)}</span>
                                    <div class="h-1.5 w-full rounded bg-gray-600">
                                        <div class="h-1.5 rounded bg-brand-500" style="width: 40%"></div>
                                    </div>
                                    <span class="text-xs text-white/80">{formatTime(activeRecording.endTime)}</span>
                                </div>
                                <button onclick={toggleMute} class="btn-secondary-icon text-white hover:text-brand-500" aria-label="Mute Toggle">
                                    {#if isMuted}
                                        <VolumeX class="h-4 w-4" />
                                    {:else}
                                        <Volume2 class="h-4 w-4" />
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="flex h-full w-full items-center justify-center text-gray-400">
                        <span>No video selected.</span>
                    </div>
                {/if}
            </div>

            <!-- Event Timeline Indicators -->
            <div class="flex flex-col gap-y-2">
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                </div>
                <div class="h-3 w-full rounded bg-gray-100 dark:bg-gray-800"></div>
                <div class="flex items-center gap-x-4 pt-1">
                    <div class="flex items-center gap-x-2">
                        <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
                        <span class="text-xs text-gray-600 dark:text-gray-300">Motion</span>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <div class="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span class="text-xs text-gray-600 dark:text-gray-300">Face</span>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <div class="h-3 w-3 rounded-full bg-rose-500"></div>
                        <span class="text-xs text-gray-600 dark:text-gray-300">Intrusion</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recording List Table Section -->
    <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
            <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Recording List</h3>
            <div class="flex items-center gap-x-2">
                <input
                    type="text"
                    placeholder="Search by person name"
                    bind:value={searchPerson}
                    oninput={loadRecordingList}
                    class="text-input"
                />
                <div class="relative inline-block">
                    <button
                        onclick={() => (openRecordingFilters = !openRecordingFilters)}
                        class="btn-primary-outline-sm"
                        aria-label="Filter Toggle"
                    >
                        <Filter class="h-4 w-4" />
                        Filters
                    </button>
                    {#if openRecordingFilters}
                        <div class="dropdown" transition:slide>
                            <ul class="flex flex-col gap-y-3 p-2">
                                <li class="grid grid-cols-1 gap-2 lg:grid-cols-2">
                                    <div class="form-groups">
                                        <span class="form-label">Camera</span>
                                        <select bind:value={selectedCamera} class="select-input">
                                            <option value="">All Cameras</option>
                                            {#each cameras as camera}
                                                <option value={camera.name}>{camera.name}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="form-groups">
                                        <span class="form-label">Date</span>
                                        <input bind:value={selectedDate} type="date" class="text-input" />
                                    </div>
                                </li>
                                <li class="flex items-center justify-end gap-x-2 pt-2">
                                    <button class="btn-secondary-md" onclick={resetFilters}>Reset</button>
                                    <button class="btn-primary-md" onclick={applyFilters}>Apply</button>
                                </li>
                            </ul>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="flex flex-col gap-y-4 px-6 py-5">
            <div class="max-w-full overflow-x-auto">
                <table class="min-w-full">
                    <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                        <tr>
                            <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">#</th>
                            <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Camera</th>
                            <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Date & Time</th>
                            <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Duration</th>
                            <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Event Type</th>
                            <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        {#if isLoading}
                            <tr>
                                <td colspan="6" class="p-4 text-center text-sm text-gray-500">Loading recordings...</td>
                            </tr>
                        {:else if recordingData.length === 0}
                            <tr>
                                <td colspan="6" class="p-4 text-center text-sm text-gray-500">No recordings found.</td>
                            </tr>
                        {:else}
                            {#each recordingData as recording, index}
                                <tr class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                    <td class="px-5 py-4 text-sm text-gray-500">{index + 1}</td>
                                    <td class="px-5 py-4 text-sm text-gray-800 dark:text-gray-200">{recording.camera?.name || 'N/A'}</td>
                                    <td class="px-5 py-4 text-sm text-gray-500">
                                        {formatDate(recording.startTime)} {formatTime(recording.startTime)}
                                    </td>
                                    <td class="px-5 py-4 text-sm text-gray-500">{recording.duration}</td>
                                    <td class="px-5 py-4 text-sm">
                                        <div class="flex items-center gap-x-2 text-gray-700 dark:text-gray-300">
                                            {#if recording.eventType === 'Face Recognition'}
                                                <User class="h-4 w-4 text-blue-500" />
                                            {:else if recording.eventType === 'Intrusion Alert'}
                                                <AlertTriangle class="h-4 w-4 text-rose-500" />
                                            {:else if recording.eventType === 'Motion Detection'}
                                                <Footprints class="h-4 w-4 text-emerald-500" />
                                            {/if}
                                            <span>{recording.eventType}</span>
                                        </div>
                                    </td>
                                    <td class="px-5 py-4 text-sm">
                                        <div class="flex items-center gap-x-2">
                                            <button 
                                                onclick={() => playRecording(recording)} 
                                                class="btn-secondary-icon" 
                                                aria-label="Play Recording"
                                            >
                                                <Play class="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>