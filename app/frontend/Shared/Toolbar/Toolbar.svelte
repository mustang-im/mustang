<hbox class="toolbar" class:border>
  <slot />
</hbox>

<script lang="ts">
  export let border = false;
</script>

<style>
  .toolbar {
    padding: 0px 4px;
    flex-wrap: wrap;
  }
  .toolbar.border {
    box-shadow: 1px 0px 3px 0px rgba(0, 0, 0, 30%);
    border-radius: var(--border-radius);
  }
  .toolbar :global(button.button) {
    border: none;
    border-radius: 0px;
    background-color: transparent;
    padding: 6px 6px;
    color: #595065;
  }
  .toolbar :global(button.button.disabled) {
    opacity: 20%;
  }
</style>
