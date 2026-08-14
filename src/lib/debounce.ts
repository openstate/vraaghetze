export type Debounced<Args extends unknown[]> = ((...args: Args) => void) & { cancel: () => void };

export function debounce<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number = 300
): Debounced<Args> {
	let timer: ReturnType<typeof setTimeout>;

	const run = (...args: Args) => {
		clearTimeout(timer);
		timer = setTimeout(() => callback(...args), delay);
	};

	run.cancel = () => clearTimeout(timer);

	return run;
}
