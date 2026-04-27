{#if $isDemo}
  <hbox class="demo-bar">
    <hbox class="text font-smallest">
      Demo
    </hbox>
  </hbox>
{/if}

<script lang="ts">
  import { isDemo } from "./demo";
</script>

<style>
  .demo-bar {
    align-items: center;
    background-color: #FFF160;
    color: #160C27;
    z-index: 5;
    width: 18px;
    height: 100%;
  }
  .text {
    transform: rotate(-90deg);
    font-weight: 500;
    text-transform: uppercase;
    width: 18px;
  }
</style>
