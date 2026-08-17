<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/components/button.svelte';
	import Field from '$lib/components/field.svelte';

	type Props = { followers: number; isFollowing: boolean; isSignedIn: boolean; canFollow: boolean };

	let { followers, isFollowing, isSignedIn, canFollow }: Props = $props();

	const followerLabel = $derived(followers === 1 ? '1 volger' : `${followers} volgers`);

	const followAction = $derived(isFollowing ? 'Ontvolg deze vraag' : 'Volg deze vraag ');

	const sentTo = $derived(page.form?.email as string | undefined);
	const error = $derived(page.form?.error as string | undefined);
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

				{#if sentTo}
					<Dialog.Description class="text-osf-canvas-600">
						We hebben een link naar <span class="font-medium">{sentTo}</span> gestuurd. Klik erop en druk
						daarna nog een keer op de bel.
					</Dialog.Description>
				{:else}
					<Dialog.Description class="text-osf-canvas-600">
						Vul je e-mailadres in. Je krijgt eerst een link om je adres te bevestigen. Daarna
						ontvang je een mail zodra deze vraag beantwoord is.
					</Dialog.Description>

					<form method="POST" action="?/volgen" use:enhance class="grid gap-4">
						<Field name="email" label="Je e-mailadres" issues={error ? [error] : undefined}>
							{#snippet children(control)}
								<input {...control} type="email" required placeholder="sanne@voorbeeld.nl" />
							{/snippet}
						</Field>

						<Button type="submit" variant="primary">Stuur bevestigingslink</Button>
					</form>
				{/if}
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
