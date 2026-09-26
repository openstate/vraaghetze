<script lang="ts">
  type Props = {
    class: 'fadeInOut' | ''
  }

  let { class: className }: Props = $props();
</script>

<style>
  .doorContainer {
    position: relative;
    margin-top: 30px;
  }

  .doorframe {
    background: white url(images/tweedekamer2.jpeg) no-repeat center;
    background-size: cover;
    border: var(--doorBorder) solid brown;
    display: flex;
    perspective: 1200px;
    transform-style: preserve-3d;
    width: var(--doorWidth);
    height: var(--doorHeight);
    margin-top: var(--marginTop);
    transition:
      width var(--doorTransitionTime) var(--doorEasing),
      height var(--doorTransitionTime) var(--doorEasing),
      margin-top var(--doorTransitionTime) var(--doorEasing),
      border var(--doorTransitionTime) var(--doorEasing);
    margin-left: auto;
    margin-right: auto;
  }

  .door {
    background: darkred url(images/door4.jpeg) no-repeat center;
    background-size: 100% 100%;
    flex-grow: 1;
    transform-style: preserve-3d;
    transform-origin: left center;
    transition: all var(--doorOpeningTime);
    backface-visibility: hidden;
    position: relative;
    transform: rotate3d(0, 1, 0, var(--doorRotate));
  }

  .door:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    transform: rotateY(180deg);
  }

  .piep {
    position: absolute;
    font-family: var(--font-serif);
    font-size: 2em;
    color: var(--color-osf-violet-400);
    transform: rotate(-40deg);
    top: 200px;
    left: 27%;
    opacity: 0;
  }

  .fadeInOut {
    animation: fadeInOut 4s linear 1 forwards;
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

<div class="doorContainer">
  <span class="piep {className}">PIEEEEP</span>
  <div class="doorframe">
    <div class="door"></div>
  </div>
</div>