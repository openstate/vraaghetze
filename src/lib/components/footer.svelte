<script lang="ts">
	import logo from '$lib/assets/logo.svg?raw';
	import { resolve } from '$app/paths';

	const platformLinks = [
		{ label: 'Vragen & Antwoorden', href: resolve('/vragen') },
		{ label: 'Kamerleden', href: resolve('/politici') },
		{ label: 'Stel een vraag', href: resolve('/vragen/stellen') }
	];
</script>

<footer class="bg-osf-violet-900 text-osf-violet-50">
	<div class="mx-auto max-w-7xl px-6 pt-16 pb-6">
		<div class="flex flex-col gap-12 xl:flex-row xl:justify-between xl:gap-16">
			<div class="max-w-xl">
				<a
					href={resolve('/')}
					class="block w-fit max-w-md text-osf-neutral-50 [&>svg]:h-auto [&>svg]:w-full"
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html logo}
					<span class="sr-only">VraagHetZe</span>
				</a>

				<p class="mt-5 text-sm">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eget venenatis augue nulla.
				</p>
			</div>

			<div class="grid max-w-xl grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3">
				<div>
					<p class="font-mono text-[13px] font-medium text-osf-shocking-pink">Platform</p>
					<ul class="mt-4 grid gap-3 text-sm font-medium">
						{#each platformLinks as link (link.label)}
							<li>
								<a href={link.href} class="hover:underline">{link.label}</a>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<p class="font-mono text-[13px] font-medium text-osf-shocking-pink">Over ons</p>
					<ul class="mt-4 grid gap-3 text-sm font-medium">
						<li><a href={resolve('/')} class="hover:underline">VraagHetZe</a></li>
						<li>
							<a href="https://openstate.eu" target="_blank" class="hover:underline">
								Open State Foundation
							</a>
						</li>
					</ul>
				</div>

				<div>
					<p class="font-mono text-[13px] font-medium text-osf-shocking-pink">Contact</p>
					<ul class="mt-4 grid gap-3 text-sm font-medium">
						<li>
							<a href="mailto:contact@openstate.eu" class="hover:underline">contact@openstate.eu</a>
						</li>
						<li>
							<a href="tel:+31203080567" class="hover:underline">020 3080567</a>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div
			class="mt-20 flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between lg:mt-28"
		>
			<p>Een project van Open State Foundation</p>

			<ul class="flex flex-wrap gap-x-8 gap-y-2">
				<li>
					<a href={resolve('/')} class="hover:underline">Moderatiebeleid</a>
				</li>
				<li>
					<a href={resolve('/')} class="hover:underline">Algemene voorwaarden</a>
				</li>
				<li>
					<a href={resolve('/')} class="hover:underline">Privacybeleid</a>
				</li>
			</ul>
		</div>
	</div>
</footer>
