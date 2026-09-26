<script lang="ts">
  type Props = {
    name: string;
    imageData: string;
    class: 'fadeInOut' | ''
  }

  let { name, imageData, class: className }: Props = $props();
</script>

<style>
  .launchPolitician {
    width: 60px;
    height: 60px;
    position: absolute;
    left: var(--left);
    top: var(--top);
    z-index: var(--zIndex);
    transform: var(--transform);
    transition: left var(--politicianTransitionTime) cubic-bezier(.91,.8,.54,1.39);
    transition-delay: var(--delay);
    display: var(--display);
  }

  .hallo {
    position: absolute;
    left: var(--textLeft);
    top: calc(var(--top) + 20px);
    color: var(--color-osf-violet-400);
    font-family: var(--font-serif);
    font-size: 1.5em;
    opacity: 0;
  }

  .fadeInOut {
    animation: fadeInOut 2s linear 1 forwards;
    animation-delay: var(--delay);
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
<img
  src={imageData}
  alt={name}
  class="launchPolitician"
/>
<span class="hallo {className}">Hallo!</span>