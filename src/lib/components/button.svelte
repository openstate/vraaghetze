<script lang="ts">
	import { Button, type ButtonRootProps } from 'bits-ui';

	type Props = ButtonRootProps & {
		variant: 'primary' | 'secondary';
		icon: string;
	};

	let { variant = 'primary', icon, class: className = '', children, ...rest }: Props = $props();

	const dynamicClass = $derived(
		variant === 'primary'
			? 'bg-osf-violet-900 text-osf-canvas-50 dark:bg-osf-neutral-50 dark:text-osf-violet-900'
			: 'bg-osf-canvas-200 text-osf-canvas-600 dark:bg-osf-violet-700 dark:text-osf-violet-100'
	);
</script>

<Button.Root
	{...rest}
	class={[
		'group grid w-fit cursor-pointer grid-cols-[0_auto_2.5rem] items-center gap-1 font-mono motion-safe:transition-[grid] motion-safe:duration-200 motion-safe:ease-in-out motion-safe:hover:grid-cols-[2.5rem_auto_0] motion-reduce:hover:grid-cols-[0_auto_2.5rem]',
		className
	]}
>
	<span
		aria-hidden={true}
		class={[
			'flex size-10 origin-left scale-0 items-center justify-center rounded-full group-hover:scale-100 motion-safe:duration-200 motion-safe:ease-in-out motion-reduce:group-hover:scale-0',
			dynamicClass
		]}
	>
		<span class={['iconify', 'size-4.5', icon]}></span>
	</span>

	<span
		class={['flex h-10 items-center rounded-sm px-4.5 text-sm leading-0 font-medium', dynamicClass]}
	>
		{@render children?.()}
	</span>

	<span
		aria-hidden={true}
		class={[
			'flex size-10 origin-left items-center justify-center rounded-full group-hover:scale-0 motion-safe:transition-[scale] motion-safe:duration-200 motion-safe:ease-in-out motion-reduce:group-hover:scale-100',
			dynamicClass
		]}
	>
		<span class={['iconify', 'size-4.5', icon]}></span>
	</span>
</Button.Root>
