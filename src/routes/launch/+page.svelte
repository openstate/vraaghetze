<script lang="ts">
	import Page from '$lib/components/page.svelte';
  import LaunchButton from '$lib/components/launch-button.svelte';
  import Door from '$lib/components/door.svelte';
  import DoorOverlay from '$lib/components/door-overlay.svelte';
  import LaunchPolitician from '$lib/components/launch-politician.svelte';
	import { onMount } from 'svelte';

  let { data } = $props();

  let firstPoliticianSlug = "lisa-westerveld";
  let secondPoliticianSlug = "laurens-dassen";
  let thirdPoliticianSlug = "jeltje-straatman";
  let firstPoliticianSlugs = [firstPoliticianSlug, secondPoliticianSlug, thirdPoliticianSlug];
  let otherPoliticianSlugs = $derived(data.slugs.filter(item => !firstPoliticianSlugs.includes(item)));

  let politicianStart = "48%";
  let politicianEnd = "58%";
  let politicianPositions = $derived.by(() => {
    let pp: { [key: string]: {top: string, left: string, transform: string, zIndex: number, delay: string, class: '' | 'fadeInOut'} } = {};
    pp[firstPoliticianSlug] = {top: "200px", left: politicianStart, transform: "rotate(20deg)", zIndex: 500, delay: "0s", class: ''};
    pp[secondPoliticianSlug] = {top: "140px", left: politicianStart, transform: "rotate(-10deg)", zIndex: 499, delay: "0s", class: ''};
    pp[thirdPoliticianSlug] = {top: "300px", left: politicianStart, transform: "rotate(3deg)", zIndex: 498, delay: "0s", class: ''};
    let otherLen = otherPoliticianSlugs.length;
    for (const [index, s] of otherPoliticianSlugs.entries()) {
      pp[s] = {
        top: `${randomNumber(30, 600)}px`,
        left: politicianStart,
        transform: `rotate(${randomNumber(-10, 30)}deg)`,
        zIndex: 497-otherLen+index,
        delay: "0s",
        class: ''
      }
    }
    return pp;
  });

  let buttonTransitionTime = $state("0.8s");
  let buttonEasing = $state("cubic-bezier(.91,.8,.54,1.39)");
  let buttonSize = $state("1px");
  let buttonMarginLeft = $state("0"); // Half of buttonSize
  let launchButtonTop = $state("270px"); // Half of buttonSize
  let launchTextLeft = $state("1px");
  let launchTextTop = $state("1px");
  let fontSize = $state("0.01rem");
  let doorWidth = $state("0");
  let doorHeight = $state("0");
  let doorBorder: '0' | '2px' = $state('0');
  let doorRotate = $state("0");
  let doorOpenAngle = "-40deg";
  let doorAppearsTime = 2;
  let doorOpeningTime = 3.5;
  let displayDoorOverlayAndPoliticians: 'none' | 'block' = $state('none');
  let piepClass: '' | 'fadeInOut' = $state('');

  const randomNumber = (start: number, end: number) => {
    const diff = end - start;
    return start + Math.floor(Math.random() * diff)
  };

  const setButtonProps = (newButtonSize: string, newButtonMarginLeft: string, newLaunchButtonTop: string, newLaunchTextLeft: string, newLaunchTextTop: string, newFontSize:string) => {
    buttonSize = newButtonSize;
    buttonMarginLeft = newButtonMarginLeft;
    launchButtonTop = newLaunchButtonTop;
    launchTextLeft = newLaunchTextLeft;
    launchTextTop = newLaunchTextTop;
    fontSize = newFontSize;
  }
  const runAndSchedule = (toRun: () => void, runTimeout: number, toSchedule?: () => void, scheduleTimeout?: number) => {
    setTimeout(
      () => {
        toRun();
        if (toSchedule) {
          setTimeout(toSchedule, scheduleTimeout);
        }
      },
      runTimeout);
  };

  const showLaunchButton = () => {
    // 270=Half of buttonSize 540
    setButtonProps("540px", "270px", "70px", "165px", "250px", "3rem");
  };

  const launchButtonClicked = () => {
    setButtonProps("1px", "0", "600px", "1px", "1px", "0.01rem");
    buttonTransitionTime = "2s";
    buttonEasing = "linear";
  };

  const showDoor = () => {
    doorWidth = "298px"; // 398 x 836
    doorHeight = "627px";
    doorBorder = '2px';
    runAndSchedule(openDoor, (doorAppearsTime + 1) * 1000);
  };

  const openDoor = () => {
    doorRotate = doorOpenAngle;
    piepClass = "fadeInOut";
    runAndSchedule(showOverlayAndHidePoliticians, doorOpeningTime * 1000)
  };

  const showOverlayAndHidePoliticians = () => {
    displayDoorOverlayAndPoliticians = 'block';
    runAndSchedule(() => {}, 0, showFirstPolitician, 2000);
  };

  const showFirstPolitician = () => {
    politicianPositions[firstPoliticianSlug]["left"] = politicianEnd;
    politicianPositions[firstPoliticianSlug]["class"] = 'fadeInOut'
    politicianPositions = {...politicianPositions};
    runAndSchedule(showSecondPolitician, 2000);
  };

  const showSecondPolitician = () => {
    politicianPositions[secondPoliticianSlug]["left"] = politicianEnd;
    politicianPositions[secondPoliticianSlug]["class"] = 'fadeInOut'
    politicianPositions = {...politicianPositions};
    runAndSchedule(showThirdPolitician, 500);
  };

  const showThirdPolitician = () => {
    politicianPositions[thirdPoliticianSlug]["left"] = politicianEnd;
    politicianPositions[thirdPoliticianSlug]["class"] = 'fadeInOut'
    politicianPositions = {...politicianPositions};
    runAndSchedule(showPoliticiansBatch1, 2000);
  };

  const showPoliticiansBatch1 = () => {
    showPoliticiansBatch(0, 3, 200)
    runAndSchedule(showPoliticiansBatch2, 2000);
  };

  const showPoliticiansBatch2 = () => {
    showPoliticiansBatch(3, 8, 150)
    runAndSchedule(showPoliticiansBatch3, 2000);
  };

  const showPoliticiansBatch3 = () => {
    showPoliticiansBatch(8, 50, 100)
  }

  const showPoliticiansBatch = (batchStart: number, batchEnd: number, useDelay: number) => {
    // otherPoliticianSlugs.length = 39
    const batch = otherPoliticianSlugs.slice(batchStart, batchEnd)
    let delay = useDelay;
    for (const slug of batch) {
      politicianPositions[slug]["left"] = politicianEnd;
      politicianPositions[slug]["class"] = 'fadeInOut'
      politicianPositions[slug]["delay"] = `${delay}ms`;
      delay += useDelay;
    }
    politicianPositions = {...politicianPositions}
  };

  const buttonClicked = (event: Event) => {
    event.preventDefault();
    runAndSchedule(launchButtonClicked, 1000, showDoor, 1000);
  };

  onMount(() => {
    runAndSchedule(showLaunchButton, 1000);
  });
</script>

<svelte:head>
</svelte:head>

<style>
  .container {
    position: relative;
    min-height: 630px;
  }
</style>

<Page width="wide" class="relative">
  <div class="container">
    <LaunchButton
      {buttonClicked}
      --launchButtonSize={buttonSize}
      --buttonMarginLeft={buttonMarginLeft}
      --launchButtonTop={launchButtonTop}
      --launchTextLeft={launchTextLeft}
      --launchTextTop={launchTextTop}
      --font-size={fontSize}
      --buttonEasing={buttonEasing}
      --buttonTransitionTime={buttonTransitionTime}
    />

    <Door
      class={piepClass}
      --doorWidth={doorWidth}
      --doorHeight={doorHeight}
      --doorBorder={doorBorder}
      --doorRotate={doorRotate}
      --doorOpeningTime="{doorOpeningTime}s"
      --doorAppearsTime="{doorAppearsTime}s"
    />

    <DoorOverlay
      --doorWidth={doorWidth}
      --doorHeight={doorHeight}
      --doorRotate={doorOpenAngle}
      --display={displayDoorOverlayAndPoliticians}
    />

    {#each Object.keys(data.politiciansWithPhotos) as slug (slug)}
      {@const p = data.politiciansWithPhotos[slug]}
      <LaunchPolitician
        name={p.name}
        imageData={p.image ?? ''}
        class={politicianPositions[p.slug]["class"]}
        --politicianTransitionTime="0.5s"
        --left={politicianPositions[p.slug]["left"]}
        --top={politicianPositions[p.slug]["top"]}
        --zIndex={politicianPositions[p.slug]["zIndex"]}
        --transform={politicianPositions[p.slug]["transform"]}
        --delay={politicianPositions[p.slug]["delay"]}
        --display={displayDoorOverlayAndPoliticians}
      />
    {/each}
  </div>
</Page>
