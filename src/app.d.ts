import type { auth, UserType, SessionType } from '$lib/server/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: UserType;
			session?: SessionType;
			isDevelopment?: boolean;
			isProduction?: boolean;
			isStaging?: boolean;
		}

		interface PageData {
			user?: User;
			meta?: { title: string };
			flash?: { type: 'success' | 'error' | 'neutral'; message: string };
		}

		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		_paq?: (string | undefined)[][];
	}
}

export {};
