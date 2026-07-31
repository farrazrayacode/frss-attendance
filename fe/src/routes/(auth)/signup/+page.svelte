<script lang="ts">
	import { auth1 } from '../../../firebase';
	import { createUserWithEmailAndPassword } from 'firebase/auth';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let errorMessage = '';
	let successMessage = '';
	let isLoading = false;

	async function handleSignup() {
		isLoading = true;
		errorMessage = '';
		successMessage = '';

		if (password !== confirmPassword) {
			errorMessage = 'Password dan Konfirmasi Password tidak cocok!';
			isLoading = false;
			return;
		}

		try {
			const userCredential = await createUserWithEmailAndPassword(auth1, email, password);
			console.log('Register berhasil:', userCredential.user);
			successMessage = 'Akun berhasil dibuat! Mengalihkan ke Sign In...';
			
			setTimeout(() => {
				window.location.href = '/signin';
			}, 1500);
		} catch (err: any) {
			console.error('Error register:', err);
			errorMessage = err.message || 'Gagal mendaftar akun baru.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
		<h2 class="mb-4 text-center text-xl font-semibold text-gray-800">Sign Up</h2>

		{#if errorMessage}
			<p class="mb-4 text-sm font-medium text-red-600">{errorMessage}</p>
		{/if}

		{#if successMessage}
			<p class="mb-4 text-sm font-medium text-green-600">{successMessage}</p>
		{/if}

		<form on:submit|preventDefault={handleSignup} class="space-y-4">
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
					minlength="6"
					class="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					required
					minlength="6"
					class="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				class="w-full rounded-md bg-green-600 py-2 text-white font-medium hover:bg-green-700 focus:outline-none disabled:bg-green-300"
			>
				{isLoading ? 'Processing...' : 'Sign Up'}
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-gray-600">
			Sudah punya akun? <a href="/signin" class="font-medium text-blue-600 hover:underline">Sign In</a>
		</p>
	</div>
</div>