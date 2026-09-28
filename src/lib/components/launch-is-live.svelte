<script lang="ts">
	import logo from '$lib/assets/logo.svg?raw';
</script>

<style>
  .container {
    position: relative;
    height: var(--height);
    max-height: var(--height);
    max-width: 100%;
  }

  .logo {
    opacity: var(--opacityLogo);
    transition: opacity 0.8s linear;
  }

  .textIs {
    opacity: var(--opacityIs);
    transition: opacity 0.8s linear;
  }

  .textLive {
    opacity: var(--opacityLive);
    transition: opacity 0.8s linear;
  }
</style>

<div class="container">
  <div class="logo max-w-11/20 mr-auto ml-auto pt-[130px]">
    {@html logo}
  </div>
  <h1 class="textIs text-center font-serif text-[6em] mt-[30px]">is</h1>
  <h1 class="textLive text-center font-serif text-[10em]">LIVE!</h1>
</div>
