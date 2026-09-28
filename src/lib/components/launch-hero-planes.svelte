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

	type Props = {
		imgClasses: string[];
	}

	const { imgClasses }: Props = $props();

	// x and y are px offsets from the top left of the cluster box, anchored to its side of the hero
	const vOffset = 50;
	const leftClusterPlanes = [
		{ src: plane1, x: 157, y: 473 + vOffset, width: 184 },
		{ src: plane2, x: -31, y: 143 + vOffset, width: 245 },
		{ src: plane3, x: 81, y: 8 + vOffset, width: 231 },
		{ src: plane4, x: 6, y: 409 + vOffset, width: 184 },
		{ src: plane5, x: -178, y: 211 + vOffset, width: 451 }
	];

	const rightClusterPlanes = [
		{ src: plane6, x: 29, y: -36 + vOffset, width: 484 },
		{ src: plane7, x: 101, y: 314 + vOffset, width: 251 },
		{ src: plane8, x: 47, y: 515 + vOffset, width: 236 },
		{ src: plane9, x: 162, y: 166 + vOffset, width: 187 },
		{ src: plane10, x: 202, y: 416 + vOffset, width: 130 }
	];
</script>

<style>
	img {
		filter: grayscale(100%);
	}

	.coloured {
		filter: grayscale(0);
    animation: colour 1.5s linear 1 forwards;
	}

	@keyframes colour {
    0% {
			filter: grayscale(100%);
    }
    100% {
			filter: grayscale(0%);
    }
  }

  .flicker {
    animation: flicker 0.8s linear 1 forwards;
  }

  @keyframes flicker {
    0% {
			filter: grayscale(100%);
    }
    50% {
			filter: grayscale(0%);
    }
    100% {
			filter: grayscale(100%);
    }
  }

</style>

<div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
	<div class="absolute top-15 -left-25 w-92 max-lg:hidden xl:-left-10">
		{#each leftClusterPlanes as plane, index (plane.src)}
			<img
				src={plane.src}
				alt=""
				class="absolute max-w-none {imgClasses[index]}"
				style="left: {plane.x}px; top: {plane.y}px; width: {plane.width}px"
			/>
		{/each}
	</div>

	<div class="absolute top-10 -right-25 w-85 max-lg:hidden xl:-right-10">
		{#each rightClusterPlanes as plane, index (plane.src)}
			<img
				src={plane.src}
				alt=""
				class="absolute max-w-none {imgClasses[index + 5]}"
				style="left: {plane.x}px; top: {plane.y}px; width: {plane.width}px"
			/>
		{/each}
	</div>
</div>
