<vbox class="workspace-list">
  <FastList columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">{$t`Workspaces`}</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row">
      <hbox>{$t`All`}</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import FastList from "../../Shared/FastList.svelte";
  import { t } from "../../../l10n/l10n";
</script>

<style>
  .workspace-list :global(.fast-list) {
    overflow: inherit;
  }
  .header {
    color: grey;
    font-size: 12px;
  }
</style>
