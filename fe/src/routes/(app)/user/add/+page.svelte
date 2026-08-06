<script lang="ts">
  import { goto } from '$app/navigation';

  let name = '';
  let email = '';
  let role = 'user';

  async function handleSubmit() {
    try {
      const response = await fetch('http://3.15.176.54:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, role })
      });

      if (response.ok) {
        alert('User berhasil ditambahkan!');
        goto('/user');
      } else {
        alert('Gagal menambahkan user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi ke backend');
    }
  }
</script>

<div class="p-6 max-w-lg mx-auto">
  <h1 class="text-2xl font-bold mb-6">Tambah User Baru</h1>

  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
    <div>
      <label class="block mb-1 font-medium" for="name">Nama</label>
      <input 
        type="text" 
        id="name"
        bind:value={name} 
        required
        class="w-full p-2 border rounded text-black"
        placeholder="Masukkan nama"
      />
    </div>

    <div>
      <label class="block mb-1 font-medium" for="email">Email</label>
      <input 
        type="email" 
        id="email"
        bind:value={email} 
        required
        class="w-full p-2 border rounded text-black"
        placeholder="Masukkan email"
      />
    </div>

    <div>
      <label class="block mb-1 font-medium" for="role">Role</label>
      <select bind:value={role} id="role" class="w-full p-2 border rounded text-black">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    <div class="flex gap-3 mt-4">
      <button 
        type="submit" 
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Simpan
      </button>
      <button 
        type="button" 
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        on:click={() => goto('/user')}
      >
        Batal
      </button>
    </div>
  </form>
</div>