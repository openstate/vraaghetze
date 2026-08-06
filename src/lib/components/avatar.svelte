<script lang="ts">
	type Props = {
		src?: string;
		name: string;
		alt?: string;
		size: number;
		loading?: 'lazy' | 'eager';
		class?: string;
	};

	let { src, name, alt = '', size, loading, class: className }: Props = $props();

	let failedSrc = $state<string>();

	const showImage = $derived(src !== undefined && src !== failedSrc);

	const parts = $derived(name.split(' ').filter(Boolean));

	const initials = $derived(
		parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? '')
	);
</script>

<div
	style="width: {size}px; height: {size}px"
	class={[
		'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-osf-shocking-pink/10 font-mono text-osf-shocking-pink',
		className
	]}
>
	{#if showImage}
		<img
			{src}
			{alt}
			{loading}
			width={size}
			height={size}
			decoding="sync"
			class="size-full object-cover"
			onerror={() => (failedSrc = src)}
			{@attach (image) => {
				if (image.complete && image.naturalWidth === 0) failedSrc = src;
			}}
		/>
	{:else}
		<span
			role={alt === '' ? undefined : 'img'}
			aria-label={alt === '' ? undefined : alt}
			aria-hidden={alt === '' ? true : undefined}
		>
			{initials}
		</span>
	{/if}
</div>
