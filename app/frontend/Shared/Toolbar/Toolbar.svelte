<hbox class="toolbar">
  <slot />
</hbox>

<script lang="ts">
</script>

<style>
  .toolbar {
    background-color: #DDDDDD;
    border: 1px solid #B2ADB8;
    padding: 0px 4px;
  }
  .toolbar :global(button.button) {
    border: none;
    border-radius: 0px;
    background-color: transparent;
    padding: 6px 6px;
  }
  .toolbar :global(button.selected:not(.disabled)) {
    background-color: #AAAAAA;
  }
</style>
