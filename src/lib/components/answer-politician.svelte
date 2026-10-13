<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import type { AnswerType, QuestionType } from '$lib/server/questions';
	import type { Snippet } from 'svelte';
	import Avatar from './avatar.svelte';

  type Props = {
    answer: AnswerType;
    question: QuestionType;
    politicianHref: ResolvedPathname;
    followButton?: Snippet;
    statusLine: Snippet;
  }

  const { answer, question, politicianHref, followButton, statusLine }: Props = $props();
</script>

<div class="p-6 sm:p-8">
  {#if answer}
    <p class="mb-6 whitespace-pre-wrap">{answer.body}</p>
  {/if}

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex min-w-0 flex-1 items-center gap-3 max-sm:basis-full">
      <a href={politicianHref} class="shrink-0" aria-hidden="true" tabindex="-1">
        <Avatar
          size={40}
          name={question.assigneeName}
          src={resolve('/politici/[slug]/foto', { slug: question.assigneeSlug })}
        />
      </a>

      {@render statusLine()}
    </div>

    {#if followButton}
      {@render followButton()}
    {/if}
  </div>

  {#if answer?.status === 'pending'}
    <p class="mt-5 text-sm text-osf-canvas-500">
      Dit antwoord wacht op moderatie en is nog niet openbaar.
    </p>
  {/if}
</div>
