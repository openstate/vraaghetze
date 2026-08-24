<script lang="ts">
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import ModerationDialog from '$lib/components/moderation-dialog.svelte';
	import { allRejectionReasons } from '$lib/moderation.js';
	import { formatDateLong } from '$lib/date-time';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

  type Question = {
    id: string;
		slug: string;
		title: string;
    body: string;
		createdAt: Date;
		status?: 'pending' | 'approved' | 'rejected';
		authorName: string;
		politicianName: string;
		politicianSlug: string;
		fraction: string | null;
		fractionName: string | null;
	};

	type Props = {
		question: Question;
  }

  let { question }: Props = $props();
  const inputClass =
		'rounded border bg-white border-osf-canvas-200 px-3 py-2 focus:border-osf-violet-500 focus:outline-none';

  let selectedRejections = $state([] as string[]);
</script>
<li>
  <article class="overflow-hidden rounded bg-osf-canvas-100">
    <div class="p-5">
      <p class="text-sm text-osf-canvas-600">
        Vraag van {question.authorName} op {formatDateLong(question.createdAt)}
      </p>

      <p class="mt-3 font-serif text-xl/snug">{question.title}</p>

      <p class="mt-2 whitespace-pre-wrap text-osf-canvas-500">{question.body}</p>

      <div class="mt-4 flex items-center gap-3">
        <a
          href={resolve('/politici/[slug]', { slug: question.politicianSlug })}
          class="shrink-0"
          aria-hidden="true"
          tabindex="-1"
        >
          <Avatar
            size={40}
            name={question.politicianName}
            src={resolve('/politici/[slug]/foto', { slug: question.politicianSlug })}
          />
        </a>
        <p class="text-sm text-osf-canvas-600">
          Gesteld aan
          <a
            href={resolve('/politici/[slug]', { slug: question.politicianSlug })}
            class="hover:underline"
          >
            {question.politicianName}
            {#if question.fraction ?? question.fractionName}
              ({question.fraction ?? question.fractionName})
            {/if}
          </a>
        </p>
      </div>
    </div>

    <hr class="mx-5 border-osf-canvas-200" />

    <form method="POST" use:enhance class="grid gap-4 p-5">
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="rejectionReason" value={selectedRejections} />

      <label class="grid gap-1.5">
        <span class="text-sm font-medium">Interne notitie (optioneel)</span>
        <textarea name="note" rows="2" class={inputClass}></textarea>
      </label>

      <div class="flex flex-wrap gap-2">
        <ModerationDialog
          title="Bevestigen"
          triggerTitle="Keur goed"
          triggerVariant="primary"
          actionValue="approved"
        >
          {#snippet children()}
            <p>Na goedkeuren zal de vraag naar het kamerlid gestuurd worden. Weet je zeker
              dat je deze vraag wilt goedkeuren?
            </p>
          {/snippet}

        </ModerationDialog>
        <ModerationDialog
          title="Geef reden(en) van afwijzing"
          triggerTitle="Wijs af"
          triggerVariant="secondary"
          actionValue="rejected"
          buttonDisabled={selectedRejections.length == 0}
        >
          {#snippet children()}
            {#each Object.entries(allRejectionReasons) as [key, title]}
              <label>
                <input
                  type="checkbox"
                  name="reasons"
                  value={key}
                  bind:group={selectedRejections}
                />
                <span class="min-w-0 flex-1" title={title}>{title}</span>
              </label>
            {/each}

          {/snippet}
        </ModerationDialog>
      </div>
    </form>
  </article>
</li>
