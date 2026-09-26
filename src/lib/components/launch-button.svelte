<script lang="ts">

  export type LaunchButtonClass = 'shake' | 'growShrink' | '';

  type Props = {
    buttonClicked: (event: Event) => void;
    class: LaunchButtonClass;
  }

  const { buttonClicked, class: className }: Props = $props();
</script>
<style>
  .button{
    background-image: -webkit-linear-gradient(top, #fde2f8, #fff);
    background-image: linear-gradient(top, #fde2f8, #fff);
    border-radius: 50%;
    box-shadow: 0px 8px 10px 0px rgba(0, 0, 0, .3), inset 0px 4px 1px 1px white, inset 0px -3px 1px 1px rgba(204,198,197,.5);
    display: block;
    left: calc(50% - var(--launchButtonSize)/2);
    top: var(--launchButtonTop);
    height: var(--launchButtonSize);
    position: absolute;
    width: var(--launchButtonSize);
    transition: all .1s linear;
    transition: width var(--buttonTransitionTime) var(--buttonEasing),
      height var(--buttonTransitionTime) var(--buttonEasing),
      left var(--buttonTransitionTime) var(--buttonEasing),
      top var(--buttonTransitionTime) var(--buttonEasing);
  }

  .button:after{
    content: "LAUNCH!";
    color:#973884;
    font-family: var(--font-serif);
    font-size: var(--font-size);
    position: absolute;
    top: 0;
    margin-left: auto;
    margin-right: auto;
    left: 30%;
    height: 100%;
    display:flex;
    flex-direction:row;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    text-shadow: 0px -1px 1px #bdb5b4, 1px 1px 1px white;
    position: absolute;
    transition: font-size var(--buttonTransitionTime) var(--buttonEasing),
      left var(--buttonTransitionTime) var(--buttonEasing),
      top var(--buttonTransitionTime) var(--buttonEasing);
  }

  .growShrink:after {
    animation-name: grow-shrink;
    animation-duration: 1s;
    animation-iteration-count: 1;
    transform-origin: center;
  }

  @keyframes grow-shrink {
    0% { transform:  scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1);}
  }  

  .button:hover{
    background-image: -webkit-linear-gradient(top, #fff, #fde2f8);
    background-image: linear-gradient(top, #fff, #fde2f8);
    color:#792b69;
    text-shadow:0px 0px 6px #792b69;
  }

  .button:active{
    background-image: -webkit-linear-gradient(top, #fde2f8, #fde2f8);
    background-image: linear-gradient(top, #fde2f8, #fde2f8);
    box-shadow: 0 3px 5px 0 rgba(0,0,0,.4), inset 0px -3px 1px 1px rgba(204,198,197,.5);
  }

  .button:active:after{
    color:#973884;
    text-shadow: 0px -1px 1px #bdb5b4, 0px 1px 1px white;
  }

  .shake {
    animation: tilt-shaking 0.15s infinite;
  }

  @keyframes tilt-shaking {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(5deg); }
    50% { transform: rotate(0eg); }
    75% { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  }
</style>

<a href="#" title="Launch!" class="button {className}" onclick={buttonClicked}></a>
