<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();
</script>

<form
	onsubmit={async (e) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const { data, error } = await authClient.signIn.magicLink({
			email: formData.get('email') as string,
      callbackURL: `${page.url.origin}/inloggen`
		});

		console.log({ data, error });
	}}
	class="mx-auto grid w-60"
>
	<input name="email" type="email" class="border" />

	<button>login</button>
</form>

<button
	class="block mx-auto"
	onclick={async () => {
		const { data, error } = await authClient.signOut();
		console.log({ data, error });
	}}
>
	uitloggen
</button>

<pre>{JSON.stringify($session.data, null, 2)}</pre>
