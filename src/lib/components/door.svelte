<script lang="ts">
  type Props = {
    class: 'fadeInOut' | ''
  }

  let { class: className }: Props = $props();
</script>

<style>
  .doorContainer {
    position: relative;
    padding-top: var(--paddingTop);
    transition: all var(--doorTransitionTime) var(--doorEasing);
  }

  .doorframe {
    background: white url(/images/tweedekamer2.jpeg) no-repeat center;
    background-size: cover;
    border: var(--doorBorder) solid brown;
    display: flex;
    perspective: 1200px;
    transform-style: preserve-3d;
    width: var(--doorWidth);
    height: var(--doorHeight);
    transform: rotate(var(--doorAppearRotate));
    transition: all var(--doorTransitionTime) var(--doorEasing);
    margin-left: auto;
    margin-right: auto;
  }

  .door {
    background: darkred url(/images/door4.jpeg) no-repeat center;
    background-size: 100% 100%;
    flex-grow: 1;
    transform-style: preserve-3d;
    transform-origin: left center;
    transition: all var(--doorOpeningTime);
    backface-visibility: hidden;
    position: relative;
    transform: rotate3d(0, 1, 0, var(--door3DRotate));
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
    display: flex;
    align-items: right;
    justify-content: right;
    font-family: var(--font-serif);
    font-size: 1em;
    color: var(--color-osf-violet-400);
    transform: rotate(-40deg);
    top: 200px;
    right: 60%;
    opacity: 0;
  }

  .fadeInOut {
    animation: fadeInOut var(--doorOpeningTime) linear 1 forwards;
    animation-delay: var(--delay);
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      font-size: 1em;
    }
    50% {
      opacity: 1;
      font-size: 3em;
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