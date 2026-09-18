<script lang="ts">
	import { notAcceptingQuestionsText } from "$lib/politicians";

	type Props = {
		name: string;
		email: string;
		oneline?: boolean;
	}

	const { name, email, oneline }: Props = $props();

	const title = $derived(
		notAcceptingQuestionsText(name, email)
	)
</script>
<style>
	:global(div.notParticipating) {
		position: absolute;
		width: 100%;
		height: 100%;
	}
	:global(div.notParticipating:after) {
		content: "Vraag\AHet Mij\ANIET";
		text-align: center;
		white-space: pre;
		position:absolute;
		top:20px;
		left:100px;
		z-index:1;
		font-family:Arial,sans-serif;
		-webkit-transform: rotate(-25deg); /* Safari */
		-moz-transform: rotate(-25deg); /* Firefox */
		-ms-transform: rotate(-25deg); /* IE */
		-o-transform: rotate(-25deg); /* Opera */
		transform: rotate(-25deg);
		font-size:20px;
		color:#c00;
		background:#fff;
		border:solid 4px #c00;
		padding:5px;
		border-radius:5px;
		zoom:1;
		filter:alpha(opacity=20);
		opacity:0.5;
		-webkit-text-shadow: 0 0 2px #c00;
		text-shadow: 0 0 2px #c00;
		box-shadow: 0 0 2px #c00;
	}
	:global(div.oneline:after) {
		content: "Vraag Het Mij NIET";
		-webkit-transform: rotate(-10deg); /* Safari */
		-moz-transform: rotate(-10deg); /* Firefox */
		-ms-transform: rotate(-10deg); /* IE */
		-o-transform: rotate(-10deg); /* Opera */
		transform: rotate(-10deg);
	}
</style>
<div class="notParticipating {oneline ? "oneline" : ""}" title={title}></div>