import { untrack } from 'svelte';
import { afterNavigate, goto } from '$app/navigation';
import { page } from '$app/state';
import { debounce, type Debounced } from './debounce';
import { normalizeTerm, toSearchParams } from './url';

type Options = {
	/** the term the loaded url searches for */
	term: () => string;
	/** name of the search field and of the parameter it fills
	 * @default 'q'
	 */
	key?: string;
	/** how long typing pauses before the url follows
	 * @default 300
	 */
	delay?: number;
};

/**
 * Makes a search form navigate as it is filled in, debounced while typing.
 * Agnostic to other form fields, though submits immediately when they change.
 *
 * Every navigation pushes a history entry, so back undoes one change at a time.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { SearchForm } from '$lib/search-form.svelte';
 *   const search = new SearchForm({ term: () => data.query.term });
 * </script>
 *
 * <form method="get" action="..." bind:this={search.form} {...search.events}>
 *   <input type="search" name={search.key} bind:value={search.term} />
 * </form>
 * ```
 */
export class SearchForm {
	form: HTMLFormElement | undefined;
	key: string;
	term = $state('');

	#debouncedSubmit: Debounced<[]>;

	constructor(options: Options) {
		this.key = options.key ?? 'q';
		this.term = untrack(options.term);
		this.#debouncedSubmit = debounce(() => this.submit(), options.delay);

		// back and forward go to a url this form did not write, so the term follows it
		afterNavigate((navigation) => {
			if (navigation.type === 'popstate') this.term = options.term();
		});
	}

	get events() {
		return {
			// if the term field is changed, submit after debounce
			oninput: (event: Event) => {
				if (this.#isTerm(event.target)) this.#debouncedSubmit();
			},
			// if a non-term field is changed, submit immediately
			onchange: (event: Event) => {
				if (!this.#isTerm(event.target)) this.submit();
			},
			// if the form is submitted manually, submit immediately
			onsubmit: (event: SubmitEvent) => {
				event.preventDefault();
				this.submit();
			}
		};
	}

	submit() {
		this.#debouncedSubmit.cancel();

		if (!this.form) return;

		const fields = new FormData(this.form);
		fields.set(this.key, normalizeTerm(this.term));

		this.#navigate(toSearchParams(fields));
	}

	clear() {
		this.#debouncedSubmit.cancel();
		this.#navigate(toSearchParams([[this.key, normalizeTerm(this.term)]]));
	}

	#isTerm(target: EventTarget | null) {
		return target === this.form?.elements.namedItem(this.key);
	}

	#navigate(params: URLSearchParams) {
		const query = String(params);
		if (query === page.url.search.slice(1)) return;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(query ? `${page.url.pathname}?${query}` : page.url.pathname, {
			keepFocus: true,
			noScroll: true
		});
	}
}
