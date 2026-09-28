<script lang="ts">
	import Page from '$lib/components/page.svelte';
  import LaunchButton, { type LaunchButtonClass } from '$lib/components/launch-button.svelte';
  import Door from '$lib/components/door.svelte';
  import DoorOverlay from '$lib/components/door-overlay.svelte';
  import LaunchPolitician from '$lib/components/launch-politician.svelte';
  import LaunchContainer from '$lib/components/launch-container.svelte';
  import LaunchIsLive from '$lib/components/launch-is-live.svelte';
	import HeroPlanes from '$lib/components/launch-hero-planes.svelte';
	import { onMount } from 'svelte';

  let { data } = $props();

  let firstPoliticianSlug = "lisa-westerveld";
  let secondPoliticianSlug = "laurens-dassen";
  let thirdPoliticianSlug = "jeltje-straatman";
  let firstPoliticianSlugs = [firstPoliticianSlug, secondPoliticianSlug, thirdPoliticianSlug];
  let otherPoliticianSlugs = $derived(data.slugs.filter(item => !firstPoliticianSlugs.includes(item)));

  const halloTexts = [
    "Hallo!",
    "Heb je een vraag?",
    "Vraag het mij!",
    "Wil je iets vragen?",
    "Vraag het maar",
    "Hoi!",
    "Stel je vraag!" 
  ] as const;
  type halloTextType = typeof halloTexts[number];

  let politicianStart = "48%";
  let politicianData = $derived.by(() => {
    let pp: { [key: string]: {text: halloTextType, top: string, left: string, leftEnd: string, transform: string, zIndex: number, delay: string, class: '' | 'fadeInOut', textLeft: string} } = {};
    pp[firstPoliticianSlug] = {text: "Wil je iets vragen?", top: "200px", left: politicianStart, leftEnd: "60%", transform: "rotate(20deg)", zIndex: 500, delay: "0s", class: '', textLeft: "65%"};
    pp[secondPoliticianSlug] = {text: "Stel je vraag!", top: "140px", left: politicianStart, leftEnd: "58%", transform: "rotate(-10deg)", zIndex: 499, delay: "0s", class: '', textLeft: "72%"};
    pp[thirdPoliticianSlug] = {text: "Vraag het maar", top: "300px", left: politicianStart, leftEnd: "62%", transform: "rotate(3deg)", zIndex: 498, delay: "0s", class: '', textLeft: "78%"};
    let otherLen = otherPoliticianSlugs.length;
    for (const [index, s] of otherPoliticianSlugs.entries()) {
      pp[s] = {
        text: halloTexts[Math.floor(Math.random() * halloTexts.length)],
        top: `${randomNumber(30, 600)}px`,
        left: politicianStart,
        leftEnd: `${randomNumber(58, 62)}%`,
        transform: `rotate(${randomNumber(-10, 30)}deg)`,
        zIndex: 497-otherLen+index,
        delay: "0s",
        class: '',
        textLeft: `${randomNumber(65, 75)}%`
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
  let finalDoorHeight = 627;
  // let doorWidth = $state(298);
  // let doorHeight = $state(finalDoorHeight);
  let doorBorder: '0' | '2px' = $state('0');
  let doorPaddingTop = $state(finalDoorHeight / 2);
  let doorAppearRotate = $state("0");
  let door3DRotate = $state("0");
  let doorOpenAngle = "-50deg";
  let doorTransitionTime = $state(2);
  let doorOpeningTime = 3;
  let doorEasing = $state("linear");
  let displayDoorOverlayAndPoliticians: 'none' | 'block' = $state('none');
  let piepClass: '' | 'fadeInOut' = $state('');
  let opacityLogo = $state(0);
  let opacityIs = $state(0);
  let opacityLive = $state(0);

  type heroImgClass = '' | 'coloured' | 'flicker';
  let heroImgClasses: heroImgClass[] = $state(new Array(10).fill(''));

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
    buttonClass = "";
    runAndSchedule(shakeButton, 1000);
    colourPlane();
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
    doorHeight = finalDoorHeight;
    doorPaddingTop = 30;
    doorBorder = '2px';
    doorAppearRotate = "720deg";
    doorEasing = "cubic-bezier(.1,.8,.9,.9)";
    colourPlane();
    runAndSchedule(openDoor, (doorTransitionTime + 1) * 1000);
  };

  const openDoor = () => {
    door3DRotate = doorOpenAngle;
    piepClass = "fadeInOut";
    colourPlane();
    runAndSchedule(showOverlayAndHidePoliticians, doorOpeningTime * 1000)
  };

  const showOverlayAndHidePoliticians = () => {
    displayDoorOverlayAndPoliticians = 'block';
    runAndSchedule(() => {}, 0, showFirstPolitician, 2000);
  };

  const showFirstPolitician = () => {
    politicianData[firstPoliticianSlug]["left"] = politicianData[firstPoliticianSlug]["leftEnd"];
    politicianData[firstPoliticianSlug]["class"] = 'fadeInOut'
    politicianData = {...politicianData};
    runAndSchedule(showSecondPolitician, 2000);
  };

  const showSecondPolitician = () => {
    politicianData[secondPoliticianSlug]["left"] = politicianData[secondPoliticianSlug]["leftEnd"];
    politicianData[secondPoliticianSlug]["class"] = 'fadeInOut'
    politicianData = {...politicianData};
    runAndSchedule(showThirdPolitician, 500);
  };

  const showThirdPolitician = () => {
    politicianData[thirdPoliticianSlug]["left"] = politicianData[thirdPoliticianSlug]["leftEnd"];
    politicianData[thirdPoliticianSlug]["class"] = 'fadeInOut'
    politicianData = {...politicianData};
    runAndSchedule(showPoliticiansBatch1, 2000);
  };

  const showPoliticiansBatch1 = () => {
    colourPlane();
    showPoliticiansBatch(0, 3, 200)
    runAndSchedule(showPoliticiansBatch2, 2000);
  };

  const showPoliticiansBatch2 = () => {
    colourPlane();
    showPoliticiansBatch(3, 8, 150)
    runAndSchedule(showPoliticiansBatch3, 2000);
  };

  const showPoliticiansBatch3 = () => {
    colourPlane();
    showPoliticiansBatch(8, 50, 100)
    runAndSchedule(hideDoor, 5000);
  }

  const showPoliticiansBatch = (batchStart: number, batchEnd: number, useDelay: number) => {
    // otherPoliticianSlugs.length = 39
    const batch = otherPoliticianSlugs.slice(batchStart, batchEnd)
    let delay = useDelay;
    for (const slug of batch) {
      politicianData[slug]["left"] = politicianData[slug]["leftEnd"];
      politicianData[slug]["class"] = 'fadeInOut'
      politicianData[slug]["delay"] = `${delay}ms`;
      delay += useDelay;
    }
    politicianData = {...politicianData}
  };

  const hideDoor = () => {
    containerOpacity = 0;
    colourPlane();
    runAndSchedule(gotoStage2, (doorTransitionTime + 1) * 1000);
  }

  const gotoStage2 = () => {
    stage = 'stage2';
    runAndSchedule(showLogo, 1000);
  }

  const showLogo = () => {
    opacityLogo = 1;
    colourPlane();
    runAndSchedule(showIs, 1000);
  }

  const showIs = () => {
    opacityIs = 1;
    colourPlane();
    runAndSchedule(showLive, 1000);
  }

  const showLive = () => {
    opacityLive = 1;
    colourPlane();
    runAndSchedule(gotoLive, 2000);
  }

  const gotoLive = () => {
    window.location.href = "https://vraaghetze.nu";
  }

  const flickerPlane = () => {
    // Reset 'flicker' class to ''
    const flickeredIndices = $state.snapshot(heroImgClasses).reduce((a: number[], e: heroImgClass, i: number) => (e === 'flicker') ? a.concat(i) : a, []);
    for (const i of flickeredIndices) {
      heroImgClasses[i] = '';
    }

    // Get a random index to flicker
    const stillGreyedIndices = $state.snapshot(heroImgClasses).reduce((a: number[], e: heroImgClass, i: number) => (e === '') ? a.concat(i) : a, []);
    if (stillGreyedIndices.length == 0) return;
    const i = stillGreyedIndices[Math.floor(Math.random() * stillGreyedIndices.length)];
  
    heroImgClasses[i] = 'flicker';
    heroImgClasses = [...heroImgClasses];
    runAndSchedule(flickerPlane, randomNumber(300, 1500));
  }

  const colourPlane = () => {
    // Get a random index to colour
    const notYetColouredIndices = $state.snapshot(heroImgClasses).reduce((a: number[], e: heroImgClass, i: number) => (e !== 'coloured') ? a.concat(i) : a, []);
    if (notYetColouredIndices.length == 0) return;
    const i = notYetColouredIndices[Math.floor(Math.random() * notYetColouredIndices.length)];

    heroImgClasses[i] = 'coloured';
    heroImgClasses = [...heroImgClasses];
  };

  onMount(() => {
    runAndSchedule(showLaunchButton, 1000);
    runAndSchedule(flickerPlane, 500);
  });
</script>

<Page width="none" class="relative">
	<HeroPlanes imgClasses={heroImgClasses} />

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
        --doorAppearRotate={doorAppearRotate}
        --paddingTop="{doorPaddingTop}px"
        --door3DRotate={door3DRotate}
        --doorOpeningTime="{doorOpeningTime}s"
        --doorTransitionTime="{doorTransitionTime}s"
      />

      <DoorOverlay
        --doorWidth="{doorWidth}px"
        --doorHeight="{doorHeight}px"
        --door3DRotate={doorOpenAngle}
        --display={displayDoorOverlayAndPoliticians}
      />

      {#each Object.keys(data.politiciansWithPhotos) as slug (slug)}
        {@const p = data.politiciansWithPhotos[slug]}
        <LaunchPolitician
          name={p.name}
          text={politicianData[p.slug]["text"]}
          imageData={p.image ?? ''}
          class={politicianData[p.slug]["class"]}
          --politicianTransitionTime="0.5s"
          --left={politicianData[p.slug]["left"]}
          --top={politicianData[p.slug]["top"]}
          --zIndex={politicianData[p.slug]["zIndex"]}
          --transform={politicianData[p.slug]["transform"]}
          --delay={politicianData[p.slug]["delay"]}
          --textLeft={politicianData[p.slug]["textLeft"]}
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
