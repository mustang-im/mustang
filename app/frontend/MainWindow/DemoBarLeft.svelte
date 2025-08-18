{#if $isDemo}
  <hbox class="demo-bar">
    <hbox class="text font-smallest">
      Demo
    </hbox>
  </hbox>
{/if}

<script lang="ts">
  import { isDemo } from "../AppsBar/demo";
</script>

<style>
  .demo-bar {
    align-items: center;
    background-color: #FFF160;
    color: #160C27;
    z-index: 5;
    width: 18px;
    /* position: absolute;
    top: 0px;
    left: 0px;
    height: 100%; */
  }
  .text {
    transform: rotate(-90deg);
    font-weight: 500;
    text-transform: uppercase;
    width: 18px;
  }
</style>
