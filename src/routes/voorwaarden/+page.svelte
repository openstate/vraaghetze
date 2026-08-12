<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';

	const { data } = $props();
</script>

<ContentPage title={data.meta.title}>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eget venenatis augue nulla.
		Suspendisse finibus quis odio nec finibus. Quisque volutpat consequat risus, non aliquet felis
		semper vitae.
	</p>

	<p>
		Mauris hendrerit diam sed eros elementum facilisis. Duis convallis posuere nulla. Sed dignissim
		lacinia tortor, ac auctor felis rutrum ac. Proin in sapien lacinia nisl rutrum condimentum in
		vitae lacus.
	</p>

	<h2>Lorem ipsum dolor sit amet</h2>

	<p>
		<strong>Vestibulum ante ipsum primis</strong> in faucibus orci luctus et ultrices posuere cubilia
		curae. Ut blandit ex a congue dignissim, maecenas vitae lobortis ligula. Aliquam nulla ipsum, ultricies
		vel purus non, vestibulum ante ipsum.
	</p>

	<ul>
		<li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
		<li>Ut blandit ex a congue dignissim, maecenas vitae lobortis ligula.</li>
		<li>Aliquam nulla ipsum, ultricies vel purus non, vestibulum ante ipsum.</li>
		<li>Mauris porttitor lorem at lacus lobortis condimentum.</li>
	</ul>

	<h2>Consectetur adipiscing elit</h2>

	<p>
		Quisque volutpat consequat risus, non aliquet felis semper vitae. Cras eget venenatis augue
		nulla, suspendisse finibus quis odio nec finibus.
	</p>

	<ol>
		<li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
		<li>Sed dignissim lacinia tortor, ac auctor felis rutrum ac.</li>
		<li>Duis convallis posuere nulla, mauris hendrerit diam sed eros.</li>
	</ol>

	<p>
		Maecenas vitae lobortis ligula. Proin in sapien lacinia nisl rutrum condimentum in vitae lacus.
		Mauris porttitor lorem at lacus lobortis condimentum, duis convallis posuere nulla.
	</p>
</ContentPage>
