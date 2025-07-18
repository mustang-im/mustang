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
    margin-top: 16px;
    height: 5em;
  }
  .text {
    transform: rotate(-90deg);
    font-weight: 500;
    text-transform: uppercase;
    margin-left: 2px;
    width: 18px;
  }
</style>
