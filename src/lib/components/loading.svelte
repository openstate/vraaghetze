<script lang="ts">
	// inspired by https://codeberg.org/qcoret/prikkert/src/branch/main/src/lib/components/loading.svelte

	import { fade } from 'svelte/transition';
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	const SHOW_DELAY = 150;
	const HIDE_DELAY = 300;
	const FADE_DURATION = 100;
	const PROGRESS_MAX = 95;
	const PROGRESS_SPEED = 0.03;

	let progress = $state(0);
	let visible = $state(false);
	let animating = $state(false);
	let frame: number | undefined;
	let showTimeout: ReturnType<typeof setTimeout> | undefined;
	let hideTimeout: ReturnType<typeof setTimeout> | undefined;

	function animate() {
		// exponential approach to the maximum, so the bar slows down as it fills up
		progress += (PROGRESS_MAX - progress) * PROGRESS_SPEED;
		if (animating && progress < PROGRESS_MAX) frame = requestAnimationFrame(animate);
	}

	beforeNavigate((navigation) => {
		// matches if the browser leaves the app entirely, which we cannot follow
		if (navigation.willUnload) return;

		clearTimeout(hideTimeout);
		clearTimeout(showTimeout);
		if (frame !== undefined) cancelAnimationFrame(frame);

		// reset instantly, without animating back to the start
		animating = false;
		progress = 0;

		// only show after a delay, so quick navigations do not flash the bar
		showTimeout = setTimeout(() => {
			visible = true;
			animating = true;
			frame = requestAnimationFrame(animate);
		}, SHOW_DELAY);
	});

	afterNavigate(() => {
		// matches if the navigation took long enough for the bar to appear
		if (visible) {
			if (frame !== undefined) cancelAnimationFrame(frame);
			animating = true;
			progress = 100;
			hideTimeout = setTimeout(() => (visible = false), HIDE_DELAY);
		} else {
			clearTimeout(showTimeout);
		}
	});
</script>

{#if visible}
	<output
		role="progressbar"
		aria-valuenow={Math.round(progress)}
		aria-valuemin={0}
		aria-valuemax={100}
		out:fade={{ duration: FADE_DURATION }}
		class="fixed top-0 right-0 left-0 z-100 h-0.75 overflow-hidden"
	>
		<div
			style:width="{progress}%"
			class={[
				'h-full rounded-r-full bg-osf-shocking-pink',
				animating && 'transition-[width] duration-200'
			]}
		></div>
	</output>
{/if}
