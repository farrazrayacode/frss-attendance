<script lang="ts">
    import { auth1 } from '../../../firebase';
    import { signInWithEmailAndPassword } from 'firebase/auth';

    let email = $state('');
    let password = $state('');
    let errorMessage = $state('');
    let isLoading = $state(false);

    async function handleSignin(e: Event) {
        e.preventDefault();
        isLoading = true;
        errorMessage = '';

        try {
            const userCredential = await signInWithEmailAndPassword(auth1, email, password);
            console.log('Login berhasil:', userCredential.user);

            // 1. Ambil Firebase ID Token
            const token = await userCredential.user.getIdToken();

            // 2. Simpan token ke localStorage sebagai 'accessToken'
            localStorage.setItem('accessToken', token);

            // 3. Pindah ke dashboard setelah token tersimpan
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Error login:', err);
            errorMessage = err.message || 'Gagal login, periksa kembali email & password.';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 class="mb-4 text-center text-xl font-semibold text-gray-800">Sign In</h2>

        {#if errorMessage}
            <p class="mb-4 text-sm font-medium text-red-600">{errorMessage}</p>
        {/if}

        <form onsubmit={handleSignin} class="space-y-4">
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    required
                    class="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    required
                    class="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                class="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
            >
                {isLoading ? 'Processing...' : 'Sign In'}
            </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
            Belum punya akun? <a href="/signup" class="font-medium text-blue-600 hover:underline">Sign Up</a>
        </p>
    </div>
</div>