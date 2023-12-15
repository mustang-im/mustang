<vbox class="workspace-list">
  <FastList>
    <svelte:fragment slot="header">
      <hbox>Workspaces</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row">
      <hbox>All</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import FastList from "../../Shared/FastList.svelte";
</script>

<style>
  .workspace-list :global(.fast-list thead tr hbox) {
    background-color: transparent;
  }
</style>
