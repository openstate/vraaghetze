<script lang="ts">

  type Props = {
    buttonClicked: (event: Event) => void;
  }

  const { buttonClicked }: Props = $props();
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
    -webkit-transition: all .1s linear;
    transition: all .1s linear;
    -webkit-transition: width var(--buttonTransitionTime) var(--buttonEasing),
      height var(--buttonTransitionTime) var(--buttonEasing),
      left var(--buttonTransitionTime) var(--buttonEasing),
      top var(--buttonTransitionTime) var(--buttonEasing);
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
    left:var(--launchTextLeft);
    top:var(--launchTextTop);
    display: block;
    height: 30px;
    text-decoration: none;
    text-shadow: 0px -1px 1px #bdb5b4, 1px 1px 1px white;
    position: absolute;
    width: 30px;
    -webkit-transition: font-size var(--buttonTransitionTime) var(--buttonEasing),
      left var(--buttonTransitionTime) var(--buttonEasing),
      top var(--buttonTransitionTime) var(--buttonEasing);
    transition: font-size var(--buttonTransitionTime) var(--buttonEasing),
      left var(--buttonTransitionTime) var(--buttonEasing),
      top var(--buttonTransitionTime) var(--buttonEasing);
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
</style>

<a href="#" title="Launch!" class="button" onclick={buttonClicked}></a>
