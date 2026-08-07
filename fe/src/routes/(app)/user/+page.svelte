<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { getAllUsers, getAllRoles, approveUser, rejectUser, deleteUser } from './api';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb.svelte';

  import {
      Check,
      ChevronDown,
      ChevronLeft,
      ChevronRight,
      Download,
      Filter,
      Key,
      PencilLine,
      Plus,
      ShieldUser,
      Trash,
      UserCheck,
      Users,
      UserSearch,
      X
  } from '@lucide/svelte';
  import Badge from '../../../components/badge/Badge.svelte';
  import { slide } from 'svelte/transition';
  import { queryClient } from '$lib/queryClient';
  import { formatDistanceToNow, parseISO } from 'date-fns'; 

  let openUserFilters = false;
  let searchUsers = '';
  let selectedRoleFilter: string = '';
  let selectedStatusFilter: 'Online' | 'Offline' | '' = '';
  let selectedApprovalFilter: 'Approved' | 'Pending' | 'Rejected' | '' = '';

  // State untuk Modal Add User
  let isAddUserOpen = false;
  let newUserName = '';
  let newUserEmail = '';
  let newUserRole = '';
  let newUserDepartment = '';

  // Query untuk mengambil data pengguna
  const usersQuery = createQuery({
      queryKey: ['users', searchUsers, selectedRoleFilter, selectedStatusFilter, selectedApprovalFilter],
      queryFn: async () => {
          const users = await getAllUsers(searchUsers);
          return users.filter(user => {
              let matchesRole = true;
              if (selectedRoleFilter && user.role?.name !== selectedRoleFilter) {
                  matchesRole = false;
              }

              let matchesStatus = true;
              if (selectedStatusFilter === 'Online' && !user.isOnline) {
                  matchesStatus = false;
              } else if (selectedStatusFilter === 'Offline' && user.isOnline) {
                  matchesStatus = false;
              }

              let matchesApproval = true;
              if (selectedApprovalFilter === 'Approved' && !user.isApproved) {
                  matchesApproval = false;
              } else if (selectedApprovalFilter === 'Pending' && user.isApproved) {
                  matchesApproval = false;
              }

              return matchesRole && matchesStatus && matchesApproval;
          });
      }
  });

  const rolesQuery = createQuery({
      queryKey: ['roles'],
      queryFn: () => getAllRoles()
  });

  $: totalUsers = $usersQuery.data?.length || 0;
  $: activeNow = $usersQuery.data?.filter(user => user.isOnline).length || 0;
  $: administrators = $usersQuery.data?.filter(user => user.role?.name === 'Admin').length || 0;
  $: pendingApproval = $usersQuery.data?.filter(user => !user.isApproved).length || 0;

  $: roleUserCounts = $usersQuery.data?.reduce((acc, user) => {
      if (user.role?.name) {
          acc[user.role.name] = (acc[user.role.name] || 0) + 1;
      }
      return acc;
  }, {} as Record<string, number>) || {};

  function formatLastLogin(dateString: Date | string | null | undefined): string { 
      if (!dateString) return 'N/A';
      try {
          const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
          return formatDistanceToNow(date, { addSuffix: true });
      } catch (e) {
          console.error("Failed to parse date:", dateString, e);
          return 'Invalid Date';
      }
  }

  function applyFilters() {
      queryClient.invalidateQueries({
          queryKey: ['users', searchUsers, selectedRoleFilter, selectedStatusFilter, selectedApprovalFilter]
      });
      openUserFilters = false; 
  }

  function resetFilters() {
      selectedRoleFilter = '';
      selectedStatusFilter = '';
      selectedApprovalFilter = '';
      queryClient.invalidateQueries({ queryKey: ['users', searchUsers] });
      openUserFilters = false; 
  }

  // Handler Submit Add User
  async function handleAddUser() {
      // Hubungkan dengan fungsi API penambahan user jika sudah tersedia di `./api`
      // contoh: await createUser({ name: newUserName, email: newUserEmail, role: newUserRole, department: newUserDepartment });
      
      console.log('Adding User:', { newUserName, newUserEmail, newUserRole, newUserDepartment });

      // Reset form & tutup modal
      newUserName = '';
      newUserEmail = '';
      newUserRole = '';
      newUserDepartment = '';
      isAddUserOpen = false;

      // Invalidate query agar tabel merefresh data terbaru
      await queryClient.invalidateQueries({ queryKey: ['users'] });
  }
</script>

<div class="flex flex-col gap-y-6">
  <Breadcrumb pageName="User Management" />
  
  <!-- User Stats -->
  <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center gap-x-4">
              <div class="bg-brand-500 flex h-14 w-14 items-center justify-center rounded-lg">
                  <Users class="h-6 w-6 text-white" />
              </div>
              <div class="flex flex-col">
                  <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{totalUsers}</p>
                  <p class="text-theme-sm text-gray-500 dark:text-white/70">Total Users</p>
              </div>
          </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center gap-x-4">
              <div class="bg-success-500 flex h-14 w-14 items-center justify-center rounded-lg">
                  <UserCheck class="h-6 w-6 text-white" />
              </div>
              <div class="flex flex-col">
                  <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{activeNow}</p>
                  <p class="text-theme-sm text-gray-500 dark:text-white/70">Active Now</p>
              </div>
          </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center gap-x-4">
              <div class="bg-error-500 flex h-14 w-14 items-center justify-center rounded-lg">
                  <ShieldUser class="h-6 w-6 text-white" />
              </div>
              <div class="flex flex-col">
                  <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{administrators}</p>
                  <p class="text-theme-sm text-gray-500 dark:text-white/70">Administrator</p>
              </div>
          </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center gap-x-4">
              <div class="bg-brand-500 flex h-14 w-14 items-center justify-center rounded-lg">
                  <UserSearch class="h-6 w-6 text-white" />
              </div>
              <div class="flex flex-col">
                  <p class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{pendingApproval}</p>
                  <p class="text-theme-sm text-gray-500 dark:text-white/70">Pending Approval</p>
              </div>
          </div>
      </div>
  </div>

  <!-- User Management -->
  <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
          <h3 class="text-base font-medium text-gray-800 dark:text-white/90">User Management</h3>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
              <!-- Tombol Add User membuka Modal -->
              <button class="btn-primary-sm" aria-label="addUserButton" on:click={() => (isAddUserOpen = true)}>
                  <Plus class="h-4 w-4" />
                  Add User
              </button>
              <button class="btn-secondary-outline-md" aria-label="exportDataButton">
                  <Download class="h-4 w-4" />
                  Export Data
              </button>
              
              <!-- Filters -->
              <div class="relative inline-block">
                  <button
                      on:click={() => (openUserFilters = !openUserFilters)}
                      aria-label="filterButton"
                      class="btn-primary-outline-sm"
                  >
                      <Filter class="h-4 w-4" />
                      Filters
                  </button>
                  {#if openUserFilters}
                      <div class="dropdown" transition:slide>
                          <ul class="flex flex-col gap-y-2">
                              <li class="form-groups">
                                  <span class="form-label">Role</span>
                                  <div class="relative z-20 bg-transparent">
                                      <select bind:value={selectedRoleFilter} class="select-input">
                                          <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                                          {#each $rolesQuery.data || [] as role}
                                              <option value={role.name} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                                  {role.name}
                                              </option>
                                          {/each}
                                      </select>
                                      <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                          <ChevronDown class="h-5 w-5" />
                                      </span>
                                  </div>
                              </li>
                              <li class="form-groups">
                                  <span class="form-label">Status</span>
                                  <div class="relative z-20 bg-transparent">
                                      <select bind:value={selectedStatusFilter} class="select-input">
                                          <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                                          {#each ['Online', 'Offline'] as option}
                                              <option value={option} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                                  {option}
                                              </option>
                                          {/each}
                                      </select>
                                      <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                          <ChevronDown class="h-5 w-5" />
                                      </span>
                                  </div>
                              </li>
                              <li class="form-groups">
                                  <span class="form-label">Approval</span>
                                  <div class="relative z-20 bg-transparent">
                                      <select bind:value={selectedApprovalFilter} class="select-input">
                                          <option value="" class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select option</option>
                                          {#each ['Approved', 'Pending'] as option}
                                              <option value={option} class="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                                  {option}
                                              </option>
                                          {/each}
                                      </select>
                                      <span class="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                          <ChevronDown class="h-5 w-5" />
                                      </span>
                                  </div>
                              </li>
                              <li class="mt-4 flex items-center justify-end gap-x-2">
                                  <button class="btn-secondary-md" on:click={resetFilters}>
                                      Reset
                                  </button>
                                  <button class="btn-primary-md" on:click={applyFilters}>
                                      <Filter class="h-4 w-4" />
                                      Apply Filters
                                  </button>
                              </li>
                          </ul>
                      </div>
                  {/if}
              </div>
          </div>
      </div>

      <div class="flex flex-col gap-y-4 px-6 py-5 lg:gap-y-6">
          <!-- Table Users -->
          <div class="max-w-full overflow-x-auto">
              <table class="min-w-full">
                  <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                      <tr>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Email</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Role</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Department</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Approval</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Last Login</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</p></th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      {#if $usersQuery.isLoading}
                          <tr>
                              <td colspan="9" class="p-4 text-center">Loading users...</td>
                          </tr>
                      {:else if $usersQuery.isError}
                          <tr>
                              <td colspan="9" class="p-4 text-center">Error loading users. Please check backend.</td>
                          </tr>
                      {:else if !$usersQuery.data || $usersQuery.data.length === 0}
                          <tr>
                              <td colspan="9" class="p-4 text-center">No users found.</td>
                          </tr>
                      {:else}
                          {#each $usersQuery.data as user, index}
                              <tr>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</p></td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{user.name}</p></td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{user.email}</p></td>
                                  <td class="px-5 py-4 sm:px-6">
                                      <Badge
                                          type={user.role?.name === 'Admin' ? 'primary' : user.role?.name === 'User' ? 'success' : 'warning'}
                                          text={user.role?.name || 'N/A'}
                                      />
                                  </td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{user.department || 'N/A'}</p></td>
                                  <td class="px-5 py-4 sm:px-6">
                                      <div class="flex items-center gap-x-1">
                                          <div class={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-success-500' : 'bg-error-500'}`}></div>
                                          <span class="text-theme-sm text-gray-500 dark:text-gray-400">
                                              {user.isOnline ? 'Online' : 'Offline'}
                                          </span>
                                      </div>
                                  </td>
                                  <td class="px-5 py-4 sm:px-6">
                                      <p class={`text-theme-sm ${user.isApproved ? 'text-success-500' : 'text-error-500'}`}>
                                          {user.isApproved ? 'Approved' : 'Pending'}
                                      </p>
                                  </td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{formatLastLogin(user.lastLogin)}</p></td>
                                  <td class="px-5 py-4 sm:px-6">
                                      <div class="flex items-center gap-x-2">
                                          {#if user.isApproved}
                                              <button aria-label="editButton" class="btn-secondary-icon">
                                                  <PencilLine class="h-4 w-4" />
                                              </button>
                                              <button aria-label="resetPasswordButton" class="btn-secondary-icon">
                                                  <Key class="h-4 w-4" />
                                              </button>
                                              <button
                                                  aria-label="deleteButton"
                                                  class="btn-secondary-icon"
                                                  on:click={async () => {
                                                      await deleteUser(user.id);
                                                      await queryClient.invalidateQueries({ queryKey: ['users', searchUsers] });
                                                  }}
                                              >
                                                  <Trash class="h-4 w-4" />
                                              </button>
                                          {:else}
                                              <button
                                                  aria-label="approveButton"
                                                  class="btn-secondary-icon"
                                                  on:click={async () => {
                                                      await approveUser(user.id);
                                                      await queryClient.invalidateQueries({ queryKey: ['users', searchUsers] });
                                                  }}
                                              >
                                                  <Check class="h-4 w-4" />
                                              </button>
                                              <button
                                                  aria-label="rejectButton"
                                                  class="btn-secondary-icon"
                                                  on:click={async () => {
                                                      await rejectUser(user.id);
                                                      await queryClient.invalidateQueries({ queryKey: ['users', searchUsers] });
                                                  }}
                                              >
                                                  <X class="h-4 w-4" />
                                              </button>
                                          {/if}
                                      </div>
                                  </td>
                              </tr>
                          {/each}
                      {/if}
                  </tbody>
              </table>
          </div>

          <!-- Pagination -->
          <div class="flex flex-col items-center gap-y-4 lg:flex-row lg:justify-between">
              <span class="text-theme-sm text-gray-400">Showing 10 to 10 of {totalUsers} entries</span>
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
                  <span class="text-theme-sm text-gray-400">rows per page</span>
                  <div class="relative z-20 bg-transparent">
                      <select class="select-input">
                          {#each [10, 20, 30, 40, 50] as perRows}
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

  <!-- Role Management -->
  <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="flex flex-col gap-y-4 border-b border-gray-100 px-6 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
          <h3 class="text-base font-medium text-gray-800 dark:text-white/90">Role Management</h3>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
              <button class="btn-primary-sm" aria-label="addRoleButton">
                  <Plus class="h-4 w-4" />
                  Add Role
              </button>
          </div>
      </div>
      <div class="flex flex-col gap-y-4 px-6 py-5 lg:gap-y-6">
          <div class="max-w-full overflow-x-auto">
              <table class="min-w-full">
                  <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                      <tr>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Users</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Permissions</p></th>
                          <th class="px-5 py-3 sm:px-6"><p class="text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</p></th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      {#if $rolesQuery.isLoading}
                          <tr>
                              <td colspan="5" class="p-4 text-center">Loading roles...</td>
                          </tr>
                      {:else if $rolesQuery.isError}
                          <tr>
                              <td colspan="5" class="p-4 text-center">Error loading roles.</td>
                          </tr>
                      {:else if !$rolesQuery.data || $rolesQuery.data.length === 0}
                          <tr>
                              <td colspan="5" class="p-4 text-center">No roles found.</td>
                          </tr>
                      {:else}
                          {#each $rolesQuery.data as role, index}
                              <tr>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</p></td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{role.name}</p></td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{roleUserCounts[role.name] || 0}</p></td>
                                  <td class="px-5 py-4 sm:px-6"><p class="text-theme-sm text-gray-500 dark:text-gray-400">{role.permissions?.join(', ') || 'None'}</p></td>
                                  <td class="px-5 py-4 sm:px-6">
                                      <div class="flex items-center gap-x-2">
                                          <button aria-label="editRoleButton" class="btn-secondary-icon">
                                              <PencilLine class="h-4 w-4" />
                                          </button>
                                          <button aria-label="deleteRoleButton" class="btn-secondary-icon">
                                              <Trash class="h-4 w-4" />
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

<!-- Modal Add User -->
{#if isAddUserOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 class="text-lg font-medium text-gray-800 dark:text-white">Add New User</h3>
              <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" on:click={() => (isAddUserOpen = false)}>
                  <X class="h-5 w-5" />
              </button>
          </div>

          <form on:submit|preventDefault={handleAddUser} class="mt-4 flex flex-col gap-y-4">
              <div>
                  <label for="userName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                      id="userName"
                      type="text"
                      bind:value={newUserName}
                      required
                      placeholder="John Doe"
                      class="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
              </div>

              <div>
                  <label for="userEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                      id="userEmail"
                      type="email"
                      bind:value={newUserEmail}
                      required
                      placeholder="user@example.com"
                      class="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
              </div>

              <div>
                  <label for="userRole" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                      id="userRole"
                      bind:value={newUserRole}
                      required
                      class="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                      <option value="" disabled>Select Role</option>
                      {#each $rolesQuery.data || [] as role}
                          <option value={role.name}>{role.name}</option>
                      {/each}
                  </select>
              </div>

              <div>
                  <label for="userDepartment" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                  <input
                      id="userDepartment"
                      type="text"
                      bind:value={newUserDepartment}
                      placeholder="Engineering"
                      class="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
              </div>

              <div class="mt-4 flex justify-end gap-x-2">
                  <button type="button" class="btn-secondary-md" on:click={() => (isAddUserOpen = false)}>
                      Cancel
                  </button>
                  <button type="submit" class="btn-primary-md">
                      Save User
                  </button>
              </div>
          </form>
      </div>
  </div>
{/if}