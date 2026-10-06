<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import type { BasicAnswerProps, ShowAnswerProps } from "./answer.svelte";
	import { formatDateLong } from '$lib/date-time';
	import OneModerationAction from '$routes/modereren/vragen/one_moderation_action.svelte';

	let { answer, moderationActions }: BasicAnswerProps & ShowAnswerProps = $props();
</script>

<div class="p-5">
  <p class="mb-3 text-sm text-osf-canvas-600">
    Vraag van {answer.authorName} op {formatDateLong(answer.questionCreatedAt)}
  </p>

  <a
    href={resolve('/vragen/[slug]', { slug: answer.questionSlug })}
    class="block font-serif text-xl/snug hover:underline"
  >
    {answer.questionTitle}
  </a>

  {#if answer.questionBody}
    <p class="mt-2 whitespace-pre-wrap text-osf-canvas-500">
      {answer.questionBody}
    </p>
  {/if}
</div>

<hr class="mx-5 border-osf-canvas-200" />

<div class="p-5">
  <p class="whitespace-pre-wrap">{answer.body}</p>

  <div class="mt-4 flex items-center gap-3">
    <a
      href={resolve('/politici/[slug]', { slug: answer.politicianSlug })}
      class="shrink-0"
      aria-hidden="true"
      tabindex="-1"
    >
      <Avatar
        size={40}
        name={answer.politicianName}
        src={resolve('/politici/[slug]/foto', { slug: answer.politicianSlug })}
      />
    </a>
    <p class="text-sm text-osf-canvas-600">
      Antwoord van
      <a
        href={resolve('/politici/[slug]', { slug: answer.politicianSlug })}
        class="hover:underline"
        >{answer.politicianName}
        {#if answer.fraction ?? answer.fractionName}({answer.fraction ??
            answer.fractionName}){/if}</a
      >
      op {formatDateLong(answer.createdAt)}
    </p>
  </div>

  {#if moderationActions.length > 0}
    <hr class="border-osf-canvas-200 mt-4" />
    <p class="text-sm font-medium mt-4">Moderatie geschiedenis</p>
    <table class="table-auto text-sm history">
      <tbody>
        {#each moderationActions as moderationAction (moderationAction.id)}
          <OneModerationAction {moderationAction} />
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<hr class="mx-5 border-osf-canvas-200" />
