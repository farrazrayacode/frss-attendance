<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { rtdb1 } from '$lib/firebase';
  import { ref, onValue, type Unsubscribe } from 'firebase/database';

  // State Variabel Statistik Dashboard
  let totalCameras = 0;
  let attendancesToday = 0;
  let alertsToday = 0;
  let blacklistCount = 0;

  let unsubscribeStats: Unsubscribe | null = null;

  onMount(() => {
    // Reference ke node 'dashboard/stats' di Firebase Realtime Database
    const statsRef = ref(rtdb1, 'dashboard/stats');

    // Subscribe realtime listener
    unsubscribeStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        totalCameras = data.total_cameras ?? 0;
        attendancesToday = data.attendances_today ?? 0;
        alertsToday = data.alerts_today ?? 0;
        blacklistCount = data.blacklist_detection ?? 0;
      }
    });
  });

  // Hapus listener saat komponen dilepas/pindah halaman
  onDestroy(() => {
    if (unsubscribeStats) {
      unsubscribeStats();
    }
  });
</script>

<div class="p-6 space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
    <span class="text-sm text-gray-500">Dashboard</span>
  </div>

  <!-- Stat Cards Row -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    
    <!-- 1. Total Cameras -->
    <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-blue-500 text-white rounded-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{totalCameras}</h3>
        <p class="text-xs font-medium text-gray-500">Total Cameras</p>
      </div>
    </div>

    <!-- 2. Attendances Today -->
    <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-emerald-500 text-white rounded-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{attendancesToday}</h3>
        <p class="text-xs font-medium text-gray-500">Attendances Today</p>
      </div>
    </div>

    <!-- 3. Alerts Today -->
    <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-red-500 text-white rounded-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{alertsToday}</h3>
        <p class="text-xs font-medium text-gray-500">Alerts Today</p>
      </div>
    </div>

    <!-- 4. Blacklist Detection -->
    <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-indigo-500 text-white rounded-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
        </svg>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{blacklistCount}</h3>
        <p class="text-xs font-medium text-gray-500">Blacklist Detection</p>
      </div>
    </div>

  </div>
</div>