<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data } = $props();
</script>

<form
	onsubmit={async (event) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		const { data: signInData, error } = await authClient.signIn.magicLink({
			email: formData.get('email') as string,
			callbackURL: `${page.url.origin}/inloggen`
		});

		console.log({ data: signInData, error });
	}}
	class="mx-auto grid w-60"
>
	<input name="email" type="email" class="border" />

	<button>login</button>
</form>

<button
	class="mx-auto block"
	onclick={async () => {
		const { data: signOutData, error } = await authClient.signOut();
		console.log({ data: signOutData, error });
		await invalidateAll();
	}}
>
	uitloggen
</button>

<pre>{JSON.stringify(data.user, null, 2)}</pre>
