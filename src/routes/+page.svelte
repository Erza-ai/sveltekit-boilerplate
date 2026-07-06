<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';

	const authServerUrl = env.PUBLIC_AUTH_SERVER_URL ?? 'https://auth.dev.erza.ai';
	const authServerLabel = authServerUrl.replace(/^https?:\/\//, '');

	const session = authClient.useSession();

	let isSigningOut = $state(false);

	async function handleSignOut() {
		try {
			isSigningOut = true;
			await authClient.signOut();
			goto(resolve('/login'));
		} catch (error) {
			console.error('Sign out failed', error);
		} finally {
			isSigningOut = false;
		}
	}
</script>

<div
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12"
>
	<!-- Background subtle accent light paths to mirror erza aesthetics -->
	<div
		class="absolute -top-[40%] -left-[20%] h-[80vw] w-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
	></div>

	<div class="w-full max-w-2xl transition-all duration-300 hover:scale-[1.002] z-10">
		{#if $session.isPending}
			<!-- Premium Skeleton Loading State -->
			<Card.Root
				class="border-border bg-card/60 backdrop-blur-xl shadow-2xl rounded-2xl p-8 space-y-6"
			>
				<div class="flex items-center space-x-4">
					<div class="h-16 w-16 animate-pulse rounded-full bg-muted"></div>
					<div class="space-y-2 flex-1">
						<div class="h-5 w-1/3 animate-pulse rounded bg-muted"></div>
						<div class="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
					</div>
				</div>
				<div class="space-y-3">
					<div class="h-4 w-full animate-pulse rounded bg-muted"></div>
					<div class="h-4 w-5/6 animate-pulse rounded bg-muted"></div>
				</div>
				<div class="h-10 w-28 animate-pulse rounded-lg bg-muted"></div>
			</Card.Root>
		{:else if !$session.data}
			<!-- Guest State -->
			<Card.Root
				class="relative border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl"
			>
				<Card.Header class="space-y-2 text-center pt-10 pb-6">
					<div
						class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background border border-border shadow-xl mb-4"
					>
						<svg
							class="h-7 w-7 text-muted-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
							/>
						</svg>
					</div>
					<Card.Title class="text-3xl font-extrabold tracking-tight text-foreground font-sans">
						Secure Workspace
					</Card.Title>
					<Card.Description class="text-sm text-muted-foreground max-w-sm mx-auto">
						You need to sign in to access the Erza Media Agency client dashboard.
					</Card.Description>
				</Card.Header>

				<Card.Content class="flex justify-center px-8 pb-10">
					<Button
						onclick={() => goto(resolve('/login'))}
						class="px-8 h-11 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-primary/10"
					>
						Go to Login Page
					</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Authenticated State -->
			<Card.Root
				class="relative border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl"
			>
				<Card.Header class="pt-8 pb-6 border-b border-border bg-background/20 px-8">
					<div class="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
						<div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
							{#if $session.data.user.image}
								<img
									src={$session.data.user.image}
									alt={$session.data.user.name}
									class="h-16 w-16 rounded-full border-2 border-primary shadow-md object-cover"
								/>
							{:else}
								<div
									class="h-16 w-16 rounded-full bg-primary border border-border flex items-center justify-center text-primary-foreground text-xl font-bold uppercase shadow-md"
								>
									{($session.data.user.name || 'U')[0]}
								</div>
							{/if}
							<div>
								<Card.Title class="text-2xl font-bold text-foreground font-sans">
									{$session.data.user.name}
								</Card.Title>
								<Card.Description class="text-sm text-muted-foreground">
									{$session.data.user.email}
								</Card.Description>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span
								class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
								Active Session
							</span>
						</div>
					</div>
				</Card.Header>

				<Card.Content class="px-8 py-6 space-y-6">
					<!-- Authentication Details Section -->
					<div>
						<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
							Session Metadata
						</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="rounded-xl border border-border bg-background/60 p-4">
								<p class="text-xs text-muted-foreground mb-1">User ID</p>
								<p class="text-sm font-mono text-foreground truncate">{$session.data.user.id}</p>
							</div>
							<div class="rounded-xl border border-border bg-background/60 p-4">
								<p class="text-xs text-muted-foreground mb-1">Session ID</p>
								<p class="text-sm font-mono text-foreground truncate">{$session.data.session.id}</p>
							</div>
							<div class="rounded-xl border border-border bg-background/60 p-4">
								<p class="text-xs text-muted-foreground mb-1">Session Created</p>
								<p class="text-sm text-foreground">
									{new Date($session.data.session.createdAt).toLocaleString()}
								</p>
							</div>
							<div class="rounded-xl border border-border bg-background/60 p-4">
								<p class="text-xs text-muted-foreground mb-1">Session Expires</p>
								<p class="text-sm text-foreground font-medium">
									{new Date($session.data.session.expiresAt).toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					<div class="rounded-xl bg-primary/5 border border-primary/10 p-4 flex gap-3">
						<svg
							class="h-5 w-5 text-primary shrink-0 mt-0.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<h4 class="text-sm font-semibold text-foreground">
								Boilerplate Authenticated Successfully
							</h4>
							<p class="text-xs text-muted-foreground mt-1 leading-relaxed">
								Your client application is communicating correctly with the Better Auth server at
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL, not an app route -->
								<a href={authServerUrl} class="text-primary hover:underline">{authServerLabel}</a>.
								The session variables above are reactive and will keep your state synced across
								components.
							</p>
						</div>
					</div>
				</Card.Content>

				<Card.Footer
					class="justify-between border-t border-border bg-background/20 py-5 px-8 flex flex-col sm:flex-row gap-4"
				>
					<p class="text-xs text-muted-foreground">Environment: Development</p>
					<Button
						onclick={handleSignOut}
						disabled={isSigningOut}
						variant="outline"
						class="w-full sm:w-auto px-6 h-10 border border-border bg-background hover:bg-muted text-foreground font-medium rounded-xl transition-all duration-200 cursor-pointer"
					>
						{#if isSigningOut}
							<svg
								class="mr-2 h-4 w-4 animate-spin text-muted-foreground"
								viewBox="0 0 24 24"
								fill="none"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Signing out...
						{:else}
							Sign Out
						{/if}
					</Button>
				</Card.Footer>
			</Card.Root>
		{/if}
	</div>
</div>
