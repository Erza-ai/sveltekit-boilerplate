<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';

	interface User {
		id: string;
		email: string;
		name?: string;
		role?: string;
		active?: boolean;
		image?: string;
		phone?: string;
	}

	const session = authClient.useSession();

	let users = $state<User[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');

	// Guard the route and load users once the session has resolved. `started` is a plain
	// (non-reactive) flag so the effect runs its body exactly once.
	let started = false;
	$effect(() => {
		const s = $session;
		if (s.isPending || started) return;
		started = true;
		if (!s.data) {
			goto(resolve('/login'));
			return;
		}
		loadUsers();
	});

	async function loadUsers() {
		try {
			isLoading = true;
			errorMessage = '';

			// 1. Exchange the better-auth session (sent via same-origin cookie) for a
			//    product-scoped access token.
			const product = env.PUBLIC_PRODUCT ?? 'local';
			const tokenRes = await fetch(`/api/auth/token/${product}`);
			if (!tokenRes.ok) {
				throw new Error(`Failed to get access token (HTTP ${tokenRes.status}).`);
			}
			const { token } = await tokenRes.json();
			if (!token) {
				throw new Error('Auth service did not return an access token.');
			}

			// 2. Call core-api directly from the browser with the bearer token.
			//    core-api must allow this origin in its CORS config, or the browser blocks it.
			const base = (env.PUBLIC_CORE_API_BASE_URL ?? '').replace(/\/$/, '');
			if (!base) {
				throw new Error('PUBLIC_CORE_API_BASE_URL is not configured.');
			}
			const usersRes = await fetch(`${base}/api/users`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!usersRes.ok) {
				throw new Error(`core-api /api/users failed (HTTP ${usersRes.status}).`);
			}

			// core-api may wrap the payload in a { result } envelope and may return a single
			// object or a list — normalise both to an array.
			const body = await usersRes.json();
			const data = body?.result ?? body;
			users = Array.isArray(data) ? data : data ? [data] : [];
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to load users.';
		} finally {
			isLoading = false;
		}
	}

	async function handleSignOut() {
		await authClient.signOut();
		goto(resolve('/login'));
	}
</script>

<div class="min-h-screen bg-background px-4 py-10">
	<div class="mx-auto w-full max-w-4xl space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
				<p class="text-sm text-muted-foreground">Users from the core API</p>
			</div>
			<button
				type="button"
				onclick={handleSignOut}
				class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 cursor-pointer"
			>
				Sign out
			</button>
		</div>

		<Card.Root
			class="border-border bg-card/50 overflow-hidden rounded-2xl shadow-xl backdrop-blur-xl"
		>
			<Card.Header class="border-b border-border">
				<Card.Title class="text-lg font-semibold text-foreground">Users</Card.Title>
				<Card.Description class="text-sm text-muted-foreground">
					{#if !isLoading && !errorMessage}
						{users.length} user{users.length === 1 ? '' : 's'} loaded
					{:else}
						GET /api/users
					{/if}
				</Card.Description>
			</Card.Header>

			<Card.Content class="p-0">
				{#if isLoading}
					<div class="space-y-3 p-6">
						{#each [0, 1, 2, 3] as i (i)}
							<div class="h-10 w-full animate-pulse rounded-lg bg-muted"></div>
						{/each}
					</div>
				{:else if errorMessage}
					<div class="p-6">
						<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
							{errorMessage}
						</div>
					</div>
				{:else if users.length === 0}
					<div class="p-10 text-center text-sm text-muted-foreground">No users found.</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-left text-sm">
							<thead
								class="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"
							>
								<tr>
									<th class="px-6 py-3 font-medium">Name</th>
									<th class="px-6 py-3 font-medium">Email</th>
									<th class="px-6 py-3 font-medium">Role</th>
									<th class="px-6 py-3 font-medium">Status</th>
								</tr>
							</thead>
							<tbody>
								{#each users as user (user.id ?? user.email)}
									<tr class="border-b border-border/50 last:border-0 hover:bg-muted/20">
										<td class="px-6 py-3 text-foreground">{user.name ?? '—'}</td>
										<td class="px-6 py-3 font-mono text-xs text-muted-foreground">{user.email}</td>
										<td class="px-6 py-3 text-muted-foreground">{user.role ?? '—'}</td>
										<td class="px-6 py-3">
											{#if user.active === false}
												<span
													class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
												>
													Inactive
												</span>
											{:else}
												<span
													class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
												>
													<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
													Active
												</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
