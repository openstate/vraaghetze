<style>
  .doorContainer {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1000;
    display: var(--display);
  }

  .doorframe {
    background: transparent;
    border: 2px solid transparent;
    display: flex;
    perspective: 1200px;
    transform-style: preserve-3d;
    width: var(--doorWidth);
    height: var(--doorHeight);
    margin-left: auto;
    margin-right: auto;
  }

  .door {
    background: darkred url(images/door4.jpeg) no-repeat center;
    background-size: 100% 100%;
    flex-grow: 1;
    transform-style: preserve-3d;
    transform-origin: left center;
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
</style>

<div class="doorContainer">
  <div class="doorframe">
    <div class="door"></div>
  </div>
</div>