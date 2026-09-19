<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import { resolve } from '$app/paths';

	type Props = { followers: number; isFollowing: boolean; isSignedIn: boolean; canFollow: boolean };

	let { followers, isFollowing, isSignedIn, canFollow }: Props = $props();

	const followerLabel = $derived(followers === 1 ? '1 volger' : `${followers} volgers`);

	const followAction = $derived(isFollowing ? 'Ontvolg deze vraag' : 'Volg deze vraag ');
</script>

{#if !canFollow}
	<Button variant="secondary" icon="mdi--bell-outline" disabled>
		{followerLabel}
	</Button>
{:else if !isSignedIn}
	<Dialog.Root>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="secondary"
					icon="mdi--bell-outline"
					title={followAction}
					aria-label="{followAction}, {followerLabel}"
				>
					{followerLabel}
				</Button>
			{/snippet}
		</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-40 bg-osf-violet-900/40" />

			<Dialog.Content
				class="fixed top-1/2 left-1/2 z-50 grid w-[min(30rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 gap-4 rounded border border-osf-canvas-200 bg-osf-neutral-50 p-6"
			>
				<div class="flex items-start justify-between gap-4">
					<Dialog.Title class="font-serif text-2xl">Volg deze vraag</Dialog.Title>

					<Dialog.Close
						aria-label="Sluiten"
						class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900"
					>
						<span class="iconify size-5 mdi--close"></span>
					</Dialog.Close>
				</div>

				<Dialog.Description class="text-osf-canvas-600">
					Als je een vraag volgt ontvang je een mail zodra de vraag beantwoord is.
					Het volgen van vragen is alleen mogelijk met een account. Klik de knop hieronder om
					een account aan te maken of om in te loggen.
				</Dialog.Description>
				<Button href={resolve('/inloggen')} variant="primary" icon="mdi--arrow-right">
					Inloggen
				</Button>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<form method="POST" action={isFollowing ? '?/ontvolgen' : '?/volgen'} use:enhance>
		<Button
			type="submit"
			variant={isFollowing ? 'primary' : 'secondary'}
			icon={isFollowing ? 'mdi--bell' : 'mdi--bell-outline'}
			title={followAction}
			aria-label="{followAction}, {followerLabel}"
		>
			{followerLabel}
		</Button>
	</form>
{/if}
