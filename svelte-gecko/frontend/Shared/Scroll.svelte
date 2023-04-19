<vbox class="scroll" bind:this={containerE}>
  <slot />
</vbox>

<script lang="ts">
  let containerE: HTMLDivElement;
  export function scrollDown() {
    containerE.scrollTop = containerE.scrollHeight;
  }
</script>

<style>
  .scroll {
    flex: 1 0 0;
    position: relative;
    overflow: auto;
  }
</style>
