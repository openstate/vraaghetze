<script lang="ts">
	import { clearDetails, type ActiveMode, type RegisterFormType } from '$lib/ask';
	import Field from '$lib/components/field.svelte';
	import CapWidget from '$lib/components/cap-widget.svelte';
	import type { UserType } from '$lib/server/auth';
	import type { IdentifyMode } from './register-or-login.svelte';
	import { resolve } from '$app/paths';
	import RegisterLoginFooter from './register-login-footer.svelte';
	import type { BasicRegisterLoginProps } from './ask-for-code.svelte';

	type Props = BasicRegisterLoginProps & {
		identifyMode: IdentifyMode;
		user?: UserType;
		capjsSiteKey?: string;
		formType: RegisterFormType;
		setActiveMode?: (mode: ActiveMode) => void;
	};
	let {
		identifyMode,
		user,
		details = $bindable(),
		issues,
		previousUrl,
		formError,
		capjsSiteKey,
		formType,
		setActiveMode,
		handleSubmit
	}: Props = $props();

	let capToken = $state('');

	function gotoLogin(e: Event) {
		clearDetails();
		if (setActiveMode) setActiveMode('login');
	}
</script>

<form method="POST" novalidate class="grid gap-6" onsubmit={handleSubmit}>
	<input type="hidden" name="formType" value={formType} />

	<p class="mb-4 text-osf-canvas-600">
		{#if formType == 'newUser'}
			Voor nieuwe gebruikers.
		{/if}
		{#if identifyMode == 'asking_question'}
			Je vraag wordt openbaar onder jouw naam. Je emailadres blijft privé.
		{/if}
		{#if formType == 'newUser'}
			Heb je al een account? Ga naar
			<button type="submit" onclick={gotoLogin} class="cursor-pointer text-osf-shocking-pink"
				>inloggen</button
			>.
		{/if}
	</p>
	<div class="grid gap-6">
		<Field name="name" label="Je volledige naam" issues={issues.name}>
			{#snippet children(control)}
				<input
					{...control}
					bind:value={details.name}
					required
					autocomplete="name"
					placeholder="Sanne de Vries"
				/>
			{/snippet}
		</Field>

		{#if formType == 'missingName'}
			<p class="text-osf-canvas-600">Je e-mailadres: {user && user.email}</p>
		{:else}
			<Field name="email" label="Je e-mailadres" issues={issues.email}>
				{#snippet children(control)}
					<input
						{...control}
						type="email"
						bind:value={details.email}
						required
						autocomplete="email"
						placeholder="sanne@voorbeeld.nl"
					/>
				{/snippet}
			</Field>
			<Field
				name="emailConfirmation"
				label="Bevestiging e-mailadres"
				issues={issues.emailConfirmation}
			>
				{#snippet children(control)}
					<input
						{...control}
						type="email"
						bind:value={details.emailConfirmation}
						required
						autocomplete="email"
						placeholder="sanne@voorbeeld.nl"
					/>
				{/snippet}
			</Field>

			<p class="text-sm text-osf-canvas-600">
				Bekijk onze
				<a href={resolve('/privacy')} target="_blank" class="text-osf-violet-500 hover:underline"
					>Privacyverklaring</a
				>
				voor informatie over de verwerking van je persoonsgegevens.
			</p>

			<Field name="acceptTandC" issues={issues.acceptTandC}>
				{#snippet children(control)}
					<label class="text-sm text-osf-canvas-600">
						<input
							type="checkbox"
							name="acceptTandC"
							value="1"
							bind:checked={details.acceptTandC}
						/>
						Ik ga akkoord met de
						<a
							href={resolve('/voorwaarden')}
							target="_blank"
							class="text-osf-violet-500 hover:underline">Algemene voorwaarden</a
						>.
					</label>
				{/snippet}
			</Field>

			<Field name="ageChecked" issues={issues.ageChecked}>
				{#snippet children(control)}
					<label class="text-sm text-osf-canvas-600">
						<input type="checkbox" name="ageChecked" value="1" bind:checked={details.ageChecked} />
						Ik ben 16 jaar of ouder, of ik ben jonger en hierbij geven mijn ouders/verzorgers toestemming.
					</label>
				{/snippet}
			</Field>

			{#if capjsSiteKey && details.acceptTandC && details.ageChecked}
				<Field name="capToken">
					{#snippet children(control)}
						<CapWidget bind:token={capToken} {capjsSiteKey} />
						<input type="hidden" name="capToken" value={capToken} />
					{/snippet}
				</Field>
			{/if}
		{/if}
	</div>

	<RegisterLoginFooter {formError} {previousUrl} />
</form>
