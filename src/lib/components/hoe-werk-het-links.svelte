<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

  const options = [
    {id: 'how', label: 'Hoe werkt het?', href: resolve('/hoe-werkt-het')},
    {id: 'faq', label: 'FAQ', href: resolve('/faq')},
    {id: 'who', label: 'Aan wie moet ik mijn vraag stellen?', href: resolve('/aan-wie')},
    {id: 'tips', label: 'Tips voor het stellen van je vraag', href: resolve('/tips')}
  ] as const;
  const optionIds = options.map((h) => h.id);
  type optionIdType = (typeof optionIds)[number];

  type Props = {selected: optionIdType};

  let { selected }: Props = $props();

  function navigate(event: Event) {
    const target = event.target as HTMLSelectElement;
    const link = options.filter(h => h.id == target.value)[0].href;
    goto(link);
  }
</script>

<div class="mx-auto w-full px-6 pt-12 max-w-3xl">
  <select
    class="rounded border border-osf-canvas-200 px-2 py-1 focus:border-osf-violet-500 focus:outline-none"
    value={selected}
    onchange={navigate}
  >
    {#each options as option}
      <option value={option.id} data-link={option.href}>{option.label}</option>
    {/each}
  </select>
</div>