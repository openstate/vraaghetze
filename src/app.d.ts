import type { auth } from '$lib/server/auth';

type User = typeof auth.$Infer.Session.user;
type Session = typeof auth.$Infer.Session.session;

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		interface PageData {
			user?: User;
		}

		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
