<select bind:value={selectedWorkspace}>
  <option value={null}>{$t`All workspaces`}</option>
  {#each appGlobal.workspaces.each as workspace}
    <option value={workspace}>{workspace.name}</option>
  {/each}
</select>

<script lang="ts">
  import { Workspace } from "../../../logic/Abstract/Workspace";
  import { appGlobal } from "../../../logic/app";
  import { t } from "../../../l10n/l10n";

  export let selectedWorkspace: Workspace;
</script>
