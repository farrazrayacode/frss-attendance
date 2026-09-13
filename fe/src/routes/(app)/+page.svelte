<script lang="ts">
  import Breadcrumb from '../../components/breadcrumb/Breadcrumb.svelte';
  import { Video, Filter, Play, RefreshCw, Calendar, Camera, User } from 'lucide-svelte';
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

  let personName = $state('');
  let cameraName = $state('');
  let date = $state('');
  let openFilters = $state(false);

  let activeRecording = $state<RecordingItem | null>(null);
  let videoPlayer: HTMLVideoElement | null = $state(null);

  const recordingsQueryKey = $derived(['recordings', personName, cameraName, date]);
  const recordingsQuery = createQuery({
    queryKey: recordingsQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (personName) params.append('personName', personName);
      if (cameraName) params.append('cameraName', cameraName);
      if (date) params.append('date', date);

      const res = await api.get(`/monitoring/recordings?${params.toString()}`);
      return (res.data.data || []) as RecordingItem[];
    }
  });

  function playRecording(item: RecordingItem) {
    activeRecording = item;
    if (videoPlayer) {
      videoPlayer.load();
      videoPlayer.play().catch(() => {});
    }
  }

  function resetFilters() {
    personName = '';
    cameraName = '';
    date = '';
    openFilters = false;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Breadcrumb pageName="Video Playback" />
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Video Player Box -->
    <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-bold text-gray-900 dark:text-white">
          {activeRecording ? `Playing: ${activeRecording.camera?.name || 'Camera'} (${activeRecording.eventType})` : 'Live Stream / Archive Player'}
        </h3>
        {#if activeRecording}
          <span class="rounded bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-900/30">
            {activeRecording.duration}
          </span>
        {/if}
      </div>

      <div class="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black">
        {#if activeRecording}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={videoPlayer}
            src={activeRecording.filePath}
            controls
            class="h-full w-full object-contain"
          ></video>
        {:else}
          <div class="flex flex-col items-center justify-center text-gray-500">
            <Video class="mb-2 h-12 w-12 opacity-50" />
            <p class="text-sm">Select a recording from the archive to start playback</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Right Side Archive List -->
    <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-bold text-gray-900 dark:text-white">Archive List</h3>
        <button
          onclick={() => (openFilters = !openFilters)}
          class="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
        >
          <Filter class="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      {#if openFilters}
        <div class="mb-4 space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <div>
            <label for="filter-person" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Person Name</label>
            <input
              id="filter-person"
              type="text"
              bind:value={personName}
              placeholder="e.g. John"
              class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label for="filter-cam" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Camera Name</label>
            <input
              id="filter-cam"
              type="text"
              bind:value={cameraName}
              placeholder="e.g. Lobby"
              class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label for="filter-date" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Date</label>
            <input
              id="filter-date"
              type="date"
              bind:value={date}
              class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <button onclick={resetFilters} class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200">Reset</button>
          </div>
        </div>
      {/if}

      <div class="flex-1 space-y-2.5 overflow-y-auto pr-1" style="max-height: 480px;">
        {#if $recordingsQuery.isLoading}
          <p class="py-4 text-center text-xs text-gray-500">Loading recordings...</p>
        {:else if !$recordingsQuery.data || $recordingsQuery.data.length === 0}
          <p class="py-4 text-center text-xs text-gray-500">No recordings found</p>
        {:else}
          {#each $recordingsQuery.data as rec}
            <button
              onclick={() => playRecording(rec)}
              class="w-full rounded-lg border p-3 text-left transition {activeRecording?.id === rec.id
                ? 'border-brand-500 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-900/20'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40'}"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-900 dark:text-white">
                  {rec.camera?.name || `Camera #${rec.camera_id}`}
                </span>
                <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {rec.duration}
                </span>
              </div>
              <div class="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>{rec.eventType}</span>
                <span>{new Date(rec.startTime).toLocaleDateString()}</span>
              </div>
              {#if rec.personName}
                <p class="mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                  👤 {rec.personName}
                </p>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>