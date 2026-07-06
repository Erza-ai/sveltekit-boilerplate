<script lang="ts">
	import { authClient } from '$lib/auth-client';

	let isLoading = $state(false);
	let errorMessage = $state('');

	async function loginWithGoogle() {
		try {
			isLoading = true;
			errorMessage = '';
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: '/'
			});
		} catch (error: any) {
			errorMessage = error.message || 'An unexpected error occurred during Google Sign-in.';
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-background px-4">
	<div class="w-full max-w-md space-y-6">
		<!-- Auth Logo -->
		<div class="flex flex-col items-center justify-center mb-4">
			<img src="/logo/logomark-lime.png" alt="Erza Studio" class="h-24 w-auto object-contain" />
			<span class="text-2xl font-bold tracking-tight text-foreground mt-2"> erza AI </span>
		</div>

		<p class="text-center text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
			Sign in to continue
		</p>

		{#if errorMessage}
			<div
				class="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 text-center animate-pulse"
			>
				{errorMessage}
			</div>
		{/if}

		<!-- OAuth Providers Button -->
		<div class="flex items-center justify-center gap-4">
			<button
				type="button"
				onclick={loginWithGoogle}
				disabled={isLoading}
				class="w-full flex items-center justify-center gap-3 px-5 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors disabled:opacity-50 cursor-pointer"
			>
				{#if isLoading}
					<svg class="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Connecting...
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Login with Google
				{/if}
			</button>
		</div>
	</div>
</div>
