<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const session = authClient.useSession();

	// Authenticated users belong on the dashboard (which holds the session info).
	let redirected = false;
	$effect(() => {
		const s = $session;
		if (s.isPending || redirected) return;
		if (s.data) {
			redirected = true;
			goto(resolve('/dashboard'));
		}
	});
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
		{/if}
	</div>
</div>
