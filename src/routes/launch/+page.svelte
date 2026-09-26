<script lang="ts">
	import Page from '$lib/components/page.svelte';
  import LaunchButton, { type LaunchButtonClass } from '$lib/components/launch-button.svelte';
  import Door from '$lib/components/door.svelte';
  import DoorOverlay from '$lib/components/door-overlay.svelte';
  import LaunchPolitician from '$lib/components/launch-politician.svelte';
  import LaunchContainer from '$lib/components/launch-container.svelte';
  import LaunchIsLive from '$lib/components/launch-is-live.svelte';
	import { onMount } from 'svelte';

  let { data } = $props();

  let firstPoliticianSlug = "lisa-westerveld";
  let secondPoliticianSlug = "laurens-dassen";
  let thirdPoliticianSlug = "jeltje-straatman";
  let firstPoliticianSlugs = [firstPoliticianSlug, secondPoliticianSlug, thirdPoliticianSlug];
  let otherPoliticianSlugs = $derived(data.slugs.filter(item => !firstPoliticianSlugs.includes(item)));

  let politicianStart = "48%";
  let politicianPositions = $derived.by(() => {
    let pp: { [key: string]: {top: string, left: string, leftEnd: string, transform: string, zIndex: number, delay: string, class: '' | 'fadeInOut', textLeft: string} } = {};
    pp[firstPoliticianSlug] = {top: "200px", left: politicianStart, leftEnd: "60%", transform: "rotate(20deg)", zIndex: 500, delay: "0s", class: '', textLeft: "65%"};
    pp[secondPoliticianSlug] = {top: "140px", left: politicianStart, leftEnd: "58%", transform: "rotate(-10deg)", zIndex: 499, delay: "0s", class: '', textLeft: "95%"};
    pp[thirdPoliticianSlug] = {top: "300px", left: politicianStart, leftEnd: "62%", transform: "rotate(3deg)", zIndex: 498, delay: "0s", class: '', textLeft: "75%"};
    let otherLen = otherPoliticianSlugs.length;
    for (const [index, s] of otherPoliticianSlugs.entries()) {
      pp[s] = {
        top: `${randomNumber(30, 600)}px`,
        left: politicianStart,
        leftEnd: `${randomNumber(58, 62)}%`,
        transform: `rotate(${randomNumber(-10, 30)}deg)`,
        zIndex: 497-otherLen+index,
        delay: "0s",
        class: '',
        textLeft: `${randomNumber(65, 95)}%`
      }
    }
    return pp;
  });

  let stage: 'stage1' | 'stage2' = $state('stage1');
  let containerOpacity = $state(1);
  let containerHeight = 700;
  let buttonClass: LaunchButtonClass = $state('');
  let buttonTransitionTime = $state(0.8);
  let buttonEasing = $state("cubic-bezier(.91,.8,.54,1.39)");
  let buttonSize = $state("1px");
  let buttonMarginLeft = $state("0"); // Half of buttonSize
  let launchButtonTop = $state("270px"); // Half of buttonSize
  let fontSize = $state("0.01rem");
  let doorWidth = $state(0);
  let doorHeight = $state(0);
  // let doorWidth = $state(298);
  // let doorHeight = $state(627);
  let doorBorder: '0' | '2px' = $state('0');
  let doorMarginTop = $state(0);
  let doorRotate = $state("0");
  let doorOpenAngle = "-40deg";
  let doorTransitionTime = $state(2);
  let doorOpeningTime = 3.5;
  let doorEasing = $state("linear");
  let displayDoorOverlayAndPoliticians: 'none' | 'block' = $state('none');
  let piepClass: '' | 'fadeInOut' = $state('');
  let opacityLogo = $state(0);
  let opacityIs = $state(0);
  let opacityLive = $state(0);

  const randomNumber = (start: number, end: number) => {
    const diff = end - start;
    return start + Math.floor(Math.random() * diff)
  };

  const setButtonProps = (newButtonSize: string, newButtonMarginLeft: string, newLaunchButtonTop: string, newFontSize:string) => {
    buttonSize = newButtonSize;
    buttonMarginLeft = newButtonMarginLeft;
    launchButtonTop = newLaunchButtonTop;
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
    setButtonProps("540px", "270px", "70px", "3rem");
    runAndSchedule(growText, (buttonTransitionTime + 0.5)*1000)
  };

  const growText = () => {
    buttonClass = "growShrink";
  }

  const buttonClicked = (event: Event) => {
    event.preventDefault();
    runAndSchedule(shakeButton, 1000);
  };

  const shakeButton = () => {
    buttonClass = "shake";
    runAndSchedule(stopShakeButton, 1000);
  }

  const stopShakeButton = () => {
    buttonClass = "";
    runAndSchedule(hideButton, 1000)
  }

  const hideButton = () => {
    setButtonProps("1px", "0", "600px", "0.01rem");
    buttonTransitionTime = 1;
    buttonEasing = "cubic-bezier(.1,.8,.9,.9)";
    runAndSchedule(showDoor, 700);
  };

  const showDoor = () => {
    doorWidth = 298; // 398 x 836
    doorHeight = 627;
    doorBorder = '2px';
    doorEasing = "cubic-bezier(.1,.8,.9,.9)";
    runAndSchedule(openDoor, (doorTransitionTime + 1) * 1000);
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
    politicianPositions[firstPoliticianSlug]["left"] = politicianPositions[firstPoliticianSlug]["leftEnd"];
    politicianPositions[firstPoliticianSlug]["class"] = 'fadeInOut'
    politicianPositions = {...politicianPositions};
    runAndSchedule(showSecondPolitician, 2000);
  };

  const showSecondPolitician = () => {
    politicianPositions[secondPoliticianSlug]["left"] = politicianPositions[secondPoliticianSlug]["leftEnd"];
    politicianPositions[secondPoliticianSlug]["class"] = 'fadeInOut'
    politicianPositions = {...politicianPositions};
    runAndSchedule(showThirdPolitician, 500);
  };

  const showThirdPolitician = () => {
    politicianPositions[thirdPoliticianSlug]["left"] = politicianPositions[thirdPoliticianSlug]["leftEnd"];
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
    runAndSchedule(hideDoor, 5000);
  }

  const showPoliticiansBatch = (batchStart: number, batchEnd: number, useDelay: number) => {
    // otherPoliticianSlugs.length = 39
    const batch = otherPoliticianSlugs.slice(batchStart, batchEnd)
    let delay = useDelay;
    for (const slug of batch) {
      politicianPositions[slug]["left"] = politicianPositions[slug]["leftEnd"];
      politicianPositions[slug]["class"] = 'fadeInOut'
      politicianPositions[slug]["delay"] = `${delay}ms`;
      delay += useDelay;
    }
    politicianPositions = {...politicianPositions}
  };

  const hideDoor = () => {
    containerOpacity = 0;
    runAndSchedule(gotoStage2, (doorTransitionTime + 1) * 1000);
  }

  const gotoStage2 = () => {
    stage = 'stage2';
    runAndSchedule(showLogo, 1000);
  }

  const showLogo = () => {
    opacityLogo = 1;
    runAndSchedule(showIs, 1000);
  }

  const showIs = () => {
    opacityIs = 1;
    runAndSchedule(showLive, 1000);
  }

  const showLive = () => {
    opacityLive = 1;
    runAndSchedule(gotoLive, 2000);
  }

  const gotoLive = () => {
    window.location.href = "https://vraaghetze.nu";
  }

  onMount(() => {
    runAndSchedule(showLaunchButton, 1000);
  });
</script>

<Page width="wide" class="relative">
  {#if stage == 'stage1'}
    <LaunchContainer --opacity={containerOpacity} --height="{containerHeight}px">
      <LaunchButton
        {buttonClicked}
        class={buttonClass}
        --launchButtonSize={buttonSize}
        --buttonMarginLeft={buttonMarginLeft}
        --launchButtonTop={launchButtonTop}
        --font-size={fontSize}
        --buttonEasing={buttonEasing}
        --buttonTransitionTime="{buttonTransitionTime}s"
      />

      <Door
        class={piepClass}
        --doorEasing={doorEasing}
        --doorWidth="{doorWidth}px"
        --doorHeight="{doorHeight}px"
        --doorBorder={doorBorder}
        --marginTop="{doorMarginTop}px"
        --doorRotate={doorRotate}
        --doorOpeningTime="{doorOpeningTime}s"
        --doorTransitionTime="{doorTransitionTime}s"
      />

      <DoorOverlay
        --doorWidth="{doorWidth}px"
        --doorHeight="{doorHeight}px"
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
          --textLeft={politicianPositions[p.slug]["textLeft"]}
          --display={displayDoorOverlayAndPoliticians}
        />
      {/each}
    </LaunchContainer>
  {/if}

  {#if stage == 'stage2'}
    <LaunchIsLive
      --opacityLogo={opacityLogo}
      --opacityIs={opacityIs}
      --opacityLive={opacityLive}
      --height="{containerHeight}px"
    />
  {/if}
</Page>
