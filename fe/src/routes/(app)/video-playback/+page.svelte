<script lang="ts">
    import Breadcrumb from '../../../components/breadcrumb/Breadcrumb.svelte';
    import { Play, Pause, RotateCcw, Filter, Calendar, Camera, User, Download, Video, Search } from 'lucide-svelte';
    import { createQuery } from '@tanstack/svelte-query';
    import api from '$lib/axios';

    interface RecordingItem {
        id: number;
        camera_id: number;
        eventType: string;
        filePath: string;
        startTime: string;
        endTime: string;
        duration: string;
        personName?: string;
        camera?: {
            name: string;
            streamUrl: string;
        };
    }

    let searchPerson = $state('');
    let searchCamera = $state('');
    let selectedDate = $state('');
    let openRecordingFilters = $state(false);

    let activeRecording = $state<RecordingItem | null>(null);
    let videoPlayer: HTMLVideoElement | null = $state(null);
    let isPlaying = $state(false);

    const recordingsQuery = createQuery(() => ({
        queryKey: ['recordings', searchPerson, searchCamera, selectedDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchPerson) params.append('personName', searchPerson);
            if (searchCamera) params.append('cameraName', searchCamera);
            if (selectedDate) params.append('date', selectedDate);

            const res = await api.get(`/monitoring/recordings?${params.toString()}`);
            return (res.data.data || []) as RecordingItem[];
        }
    }));

    function playRecording(item: RecordingItem) {
        activeRecording = item;
        isPlaying = true;
        if (videoPlayer) {
            videoPlayer.load();
            videoPlayer.play().catch((err) => console.log('Autoplay prevent:', err));
        }
    }

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

    function resetFilters() {
        searchPerson = '';
        searchCamera = '';
        selectedDate = '';
        openRecordingFilters = false;
    }
</script>

<div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageTitle="Video Playback & Incident Archive" />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Main Video Screen Player -->
        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
            <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Video class="h-5 w-5 text-brand-500" />
                    <h3 class="font-bold text-gray-900 dark:text-white">
                        {activeRecording ? `Playing: ${activeRecording.camera?.name || 'Camera'} - ${activeRecording.eventType}` : 'Playback Player'}
                    </h3>
                </div>
                {#if activeRecording}
                    <span class="rounded bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        {activeRecording.duration}
                    </span>
                {/if}
            </div>

            <!-- Video Container -->
            <div class="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black">
                {#if activeRecording}
                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video
                        bind:this={videoPlayer}
                        src={activeRecording.filePath}
                        controls
                        class="h-full w-full object-contain"
                        onplay={() => (isPlaying = true)}
                        onpause={() => (isPlaying = false)}
                    ></video>
                {:else}
                    <div class="flex flex-col items-center justify-center text-gray-500">
                        <Video class="mb-2 h-12 w-12 stroke-1 opacity-50" />
                        <p class="text-sm">Select a recording from the archive list to start playback</p>
                    </div>
                {/if}
            </div>

            <!-- Player Meta Info -->
            {#if activeRecording}
                <div class="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800/60 sm:grid-cols-4">
                    <div>
                        <span class="text-gray-500">Person Detected:</span>
                        <div class="font-medium text-gray-900 dark:text-white">{activeRecording.personName || 'Unidentified'}</div>
                    </div>
                    <div>
                        <span class="text-gray-500">Event Type:</span>
                        <div class="font-medium text-gray-900 dark:text-white">{activeRecording.eventType}</div>
                    </div>
                    <div>
                        <span class="text-gray-500">Start Time:</span>
                        <div class="font-medium text-gray-900 dark:text-white">{new Date(activeRecording.startTime).toLocaleTimeString()}</div>
                    </div>
                    <div>
                        <span class="text-gray-500">End Time:</span>
                        <div class="font-medium text-gray-900 dark:text-white">{new Date(activeRecording.endTime).toLocaleTimeString()}</div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Right Side: Archives & Filtering -->
        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div class="mb-4 flex items-center justify-between">
                <h3 class="font-bold text-gray-900 dark:text-white">Recordings Archive</h3>
                <button
                    onclick={() => (openRecordingFilters = !openRecordingFilters)}
                    class="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <Filter class="h-3.5 w-3.5" />
                    Filters
                </button>
            </div>

            <!-- Filter Panel -->
            {#if openRecordingFilters}
                <div class="mb-4 space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div>
                        <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Search Person</label>
                        <input
                            type="text"
                            bind:value={searchPerson}
                            placeholder="e.g. Farraz"
                            class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Camera Name</label>
                        <input
                            type="text"
                            bind:value={searchCamera}
                            placeholder="e.g. Main Lobby"
                            class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Date</label>
                        <input
                            type="date"
                            bind:value={selectedDate}
                            class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div class="flex justify-end gap-2 pt-1">
                        <button onclick={resetFilters} class="rounded px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
                            Reset
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Recordings List -->
            <div class="flex-1 space-y-2.5 overflow-y-auto pr-1" style="max-height: 480px;">
                {#if $recordingsQuery.isLoading}
                    <div class="p-4 text-center text-xs text-gray-500">Loading archives...</div>
                {:else if $recordingsQuery.isError}
                    <div class="p-4 text-center text-xs text-red-500">Failed to load recordings</div>
                {:else if !$recordingsQuery.data || $recordingsQuery.data.length === 0}
                    <div class="p-4 text-center text-xs text-gray-500">No recordings found</div>
                {:else}
                    {#each $recordingsQuery.data as rec}
                        <button
                            onclick={() => playRecording(rec)}
                            class={`w-full text-left transition rounded-lg border p-3 ${
                                activeRecording?.id === rec.id
                                    ? 'border-brand-500 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-900/20'
                                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40'
                            }`}
                        >
                            <div class="flex items-center justify-between">
                                <span class="font-medium text-xs text-gray-900 dark:text-white">
                                    {rec.camera?.name || `Camera #${rec.camera_id}`}
                                </span>
                                <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    {rec.duration}
                                </span>
                            </div>
                            <div class="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                                <span>{rec.eventType}</span>
                                <span>{new Date(rec.startTime).toLocaleDateString()}</span>
                            </div>
                            {#if rec.personName}
                                <div class="mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                                    👤 {rec.personName}
                                </div>
                            {/if}
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>