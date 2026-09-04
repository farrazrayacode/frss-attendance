<script lang="ts">
  import { page } from '$app/stores';
  import { mainMenuItems, masterMenuItems, poultryMenuItems, singleMenuItems } from './data';
  import { ChevronRight } from 'lucide-svelte';

  export let sidebarToggle: boolean = false;
</script>

<aside
  class="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:translate-x-0 {sidebarToggle ? 'translate-x-0' : '-translate-x-full'}"
  aria-label="Sidebar"
>
  <!-- Logo Header -->
  <div class="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
    <a href="/dashboard" class="flex items-center gap-3">
      <img src="/logo/logo-icon.svg" alt="Logo" class="h-8 w-8" />
      <span class="text-lg font-bold text-gray-900 dark:text-white">FRSS System</span>
    </a>
  </div>

  <!-- Menu Navigation -->
  <div class="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-5">
    <div class="space-y-6">
      <!-- Main Menu -->
      <div>
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main Menu
        </p>
        <ul class="space-y-1">
          {#each mainMenuItems as item}
            {@const isActive = $page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/')}
            <li>
              <a
                href={item.href}
                class="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors {isActive
                  ? 'bg-brand-50 text-brand-500 dark:bg-brand-900/20 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}"
              >
                <div class="flex items-center gap-3">
                  <svelte:component
                    this={item.icon}
                    class="h-5 w-5 {isActive ? 'text-brand-500 dark:text-brand-400' : 'text-gray-400'}"
                  />
                  <span>{item.title}</span>
                </div>
                {#if isActive}
                  <ChevronRight class="h-4 w-4 text-brand-500" />
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Master / Admin Menu -->
      {#if masterMenuItems.length > 0}
        <div>
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Master Data
          </p>
          <ul class="space-y-1">
            {#each masterMenuItems as item}
              {@const isActive = $page.url.pathname === item.href || $page.url.pathname.startsWith(item.href)}
              <li>
                <a
                  href={item.href}
                  class="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors {isActive
                    ? 'bg-brand-50 text-brand-500 dark:bg-brand-900/20 dark:text-brand-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}"
                >
                  <div class="flex items-center gap-3">
                    <svelte:component
                      this={item.icon}
                      class="h-5 w-5 {isActive ? 'text-brand-500 dark:text-brand-400' : 'text-gray-400'}"
                    />
                    <span>{item.title}</span>
                  </div>
                  {#if isActive}
                    <ChevronRight class="h-4 w-4 text-brand-500" />
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <!-- System Status Footer -->
    <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-green-500"></span>
        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">System Online</span>
      </div>
    </div>
  </div>
</aside>