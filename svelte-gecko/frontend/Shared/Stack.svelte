<vbox class="stack">
  <slot />
</vbox>

<script lang="ts">
  /* Size not working */
</script>

<style>
  .stack {
    position: relative;
    flex: 1 0 0;
  }
  .stack :global(> *) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
