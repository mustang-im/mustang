<vbox class="workspace-list">
  <FastList columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">Workspaces</hbox>
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
  .header {
    color: grey;
    font-size: 12px;
  }
</style>
