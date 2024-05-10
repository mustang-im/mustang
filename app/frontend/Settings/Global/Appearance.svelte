<vbox class="appearance">
  <DarkMode />
</vbox>

<script lang="ts">
  import DarkMode from "./DarkMode.svelte";
</script>

<style>
  .appearance :global(.darkmode svg) {
    width: 32px;
    height: 32px;
  }
</style>
