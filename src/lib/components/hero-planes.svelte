<script lang="ts">
	import plane1 from '$lib/assets/plane-1.webp';
	import plane2 from '$lib/assets/plane-2.webp';
	import plane3 from '$lib/assets/plane-3.webp';
	import plane4 from '$lib/assets/plane-4.webp';
	import plane5 from '$lib/assets/plane-5.webp';
	import plane6 from '$lib/assets/plane-6.webp';
	import plane7 from '$lib/assets/plane-7.webp';
	import plane8 from '$lib/assets/plane-8.webp';
	import plane9 from '$lib/assets/plane-9.webp';
	import plane10 from '$lib/assets/plane-10.webp';

	// x and y are px offsets from the top left of the cluster box, anchored to its side of the hero
	const leftClusterPlanes = [
		{ src: plane1, x: 157, y: 473, width: 184 },
		{ src: plane2, x: -31, y: 143, width: 245 },
		{ src: plane3, x: 81, y: 8, width: 231 },
		{ src: plane4, x: 6, y: 409, width: 184 },
		{ src: plane5, x: -178, y: 211, width: 451 }
	];

	const rightClusterPlanes = [
		{ src: plane6, x: 29, y: -36, width: 484 },
		{ src: plane7, x: 101, y: 314, width: 251 },
		{ src: plane8, x: 47, y: 515, width: 236 },
		{ src: plane9, x: 162, y: 166, width: 187 },
		{ src: plane10, x: 202, y: 416, width: 130 }
	];

	// below lg the clusters do not fit beside the text, so a selection flies under the form instead.
	// x runs from the plane's own anchor and y from the bottom, both in --plane-unit design units
	const compactPlanes = [
		{ src: plane4, anchor: 'left', x: -15, y: 84, width: 184 },
		{ src: plane8, anchor: 'right', x: 70, y: 3, width: 236 },
		{ src: plane5, anchor: 'left', x: -84, y: -145, width: 451 },
		{ src: plane10, anchor: 'right', x: 29, y: 44, width: 130 }
	];
</script>

<div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
	<div class="absolute top-15 -left-25 w-92 max-lg:hidden xl:-left-10">
		{#each leftClusterPlanes as plane (plane.src)}
			<img
				src={plane.src}
				alt=""
				class="absolute max-w-none"
				style="left: {plane.x}px; top: {plane.y}px; width: {plane.width}px"
			/>
		{/each}
	</div>

	<div class="absolute top-10 -right-25 w-85 max-lg:hidden xl:-right-10">
		{#each rightClusterPlanes as plane (plane.src)}
			<img
				src={plane.src}
				alt=""
				class="absolute max-w-none"
				style="left: {plane.x}px; top: {plane.y}px; width: {plane.width}px"
			/>
		{/each}
	</div>

	<div class="lg:hidden">
		{#each compactPlanes as plane (plane.src)}
			<img
				src={plane.src}
				alt=""
				class="absolute max-w-none"
				style="{plane.anchor}: calc({plane.x} * var(--plane-unit)); bottom: calc({plane.y} * var(--plane-unit)); width: calc({plane.width} * var(--plane-unit))"
			/>
		{/each}
	</div>
</div>
