<script lang="ts">
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb.svelte';
  import { Search, Filter, Check, X, Trash2, UserPlus, Shield, Clock, CheckCircle2, UserX } from 'lucide-svelte';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import api from '$lib/axios';

  const queryClient = useQueryClient();

  // Filter state untuk Active Users Table
  let search = $state('');
  let roleFilter = $state('');
  let statusFilter = $state('');

  // Modal Tambah User
  let isAddModalOpen = $state(false);
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let department = $state('');
  let isSubmitting = $state(false);

    // 1. Query untuk Pending Approvals Table
  const pendingUsersQuery = createQuery({
    queryKey: ['users', 'pending'],
    queryFn: async () => {
      const res = await api.get('/users?approval=Pending');
      return res.data.data || [];
    }
  });

  // 2. Query untuk Active Users Table
  const activeUsersQueryKey = $derived(['users', 'active', search, roleFilter, statusFilter]);
  const activeUsersQuery = createQuery({
    queryKey: activeUsersQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('approval', 'Approved');
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/users?${params.toString()}`);
      return res.data.data || [];
    }
  });

  async function handleApprove(userId: string) {
    try {
      await api.patch(`/users/${userId}/approve`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyetujui user');
    }
  }

  async function handleReject(userId: string) {
    if (!confirm('Tolak dan batalkan permohonan registrasi user ini?')) return;
    try {
      await api.delete(`/users/${userId}/reject`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menolak user');
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Hapus akun user ini secara permanen?')) return;
    try {
      await api.delete(`/users/${userId}`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus user');
    }
  }

  async function handleCreateUser(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        department
      });
      alert('User baru berhasil ditambahkan!');
      isAddModalOpen = false;
      name = '';
      email = '';
      password = '';
      department = '';
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Gagal menambah user');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="space-y-8">
  <!-- Header & Action -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <Breadcrumb pageName="User Management" />
    <button
      onclick={() => (isAddModalOpen = true)}
      class="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 shadow-sm transition"
    >
      <UserPlus class="h-4 w-4" />
      Add New User
    </button>
  </div>

  <!-- TABEL 1: PENDING APPROVALS -->
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <div class="flex items-center gap-2.5">
        <Clock class="h-5 w-5 text-amber-500" />
        <h3 class="font-bold text-gray-900 dark:text-white">Pending User Approvals</h3>
        {#if $pendingUsersQuery.data && $pendingUsersQuery.data.length > 0}
          <span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {$pendingUsersQuery.data.length} pending
          </span>
        {/if}
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-gray-600 dark:text-gray-400">
        <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <tr>
            <th class="px-6 py-3.5">Applicant User</th>
            <th class="px-6 py-3.5">Department</th>
            <th class="px-6 py-3.5">Registration Date</th>
            <th class="px-6 py-3.5">Status</th>
            <th class="px-6 py-3.5 text-right">Approval Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          {#if $pendingUsersQuery.isLoading}
            <tr>
              <td colspan="5" class="px-6 py-6 text-center text-gray-500">Checking pending registrations...</td>
            </tr>
          {:else if !$pendingUsersQuery.data || $pendingUsersQuery.data.length === 0}
            <tr>
              <td colspan="5" class="px-6 py-6 text-center text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-green-500" />
                  <span>No pending user approvals. All requests are cleared.</span>
                </div>
              </td>
            </tr>
          {:else}
            {#each $pendingUsersQuery.data as user}
              <tr class="hover:bg-amber-50/40 dark:hover:bg-amber-950/10">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">{user.name || 'No Name'}</div>
                      <div class="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">{user.department || '-'}</td>
                <td class="px-6 py-4">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Awaiting Review
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      onclick={() => handleApprove(user.id)}
                      class="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                    >
                      <Check class="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onclick={() => handleReject(user.id)}
                      class="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <X class="h-3.5 w-3.5" /> Reject
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

  <!-- TABEL 2: ACTIVE USERS MANAGEMENT -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-gray-900 dark:text-white">Active System Users</h3>
    </div>

    <!-- Filter Bar -->
    <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            bind:value={search}
            placeholder="Search name, email, department..."
            class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <select
          bind:value={statusFilter}
          class="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">All Activity Status</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>

        <button
          onclick={() => {
            search = '';
            roleFilter = '';
            statusFilter = '';
          }}
          class="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
        >
          <Filter class="h-4 w-4" /> Reset Filters
        </button>
      </div>
    </div>

    <!-- Active Table -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600 dark:text-gray-400">
          <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th class="px-6 py-4">User</th>
              <th class="px-6 py-4">Department</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Online Status</th>
              <th class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            {#if $activeUsersQuery.isLoading}
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">Loading active users...</td>
              </tr>
            {:else if !$activeUsersQuery.data || $activeUsersQuery.data.length === 0}
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">No active users found</td>
              </tr>
            {:else}
              {#each $activeUsersQuery.data as user}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">{user.name || 'No Name'}</div>
                        <div class="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">{user.department || '-'}</td>
                  <td class="px-6 py-4">
                    <span class="rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {user.role?.name || 'User'}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    {#if user.isOnline}
                      <span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span> Online
                      </span>
                    {:else}
                      <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <span class="h-1.5 w-1.5 rounded-full bg-gray-400"></span> Offline
                      </span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      onclick={() => handleDelete(user.id)}
                      title="Delete User"
                      class="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
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

<!-- Modal Create User -->
{#if isAddModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Add New User</h3>
        <button onclick={() => (isAddModalOpen = false)} class="text-gray-400 hover:text-gray-600">
          <X class="h-5 w-5" />
        </button>
      </div>
      <form onsubmit={handleCreateUser} class="space-y-4">
        <div>
          <label for="create-name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <input
            id="create-name"
            type="text"
            bind:value={name}
            required
            placeholder="John Doe"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label for="create-email" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
          <input
            id="create-email"
            type="email"
            bind:value={email}
            required
            placeholder="john@example.com"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label for="create-password" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            id="create-password"
            type="password"
            bind:value={password}
            required
            placeholder="Min 8 characters"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label for="create-dept" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
          <input
            id="create-dept"
            type="text"
            bind:value={department}
            placeholder="e.g. IT, Security"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onclick={() => (isAddModalOpen = false)}
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}