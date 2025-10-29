<hbox class="workspace-selector">
  <vbox class="workspace"
      style="--workspace-color: var(--bg);"
    on:click={event => onChange(null, event)}
    >
    <hbox class="button">
      <RoundButton
        label={$t`All`}
        {iconSize}
        icon={defaultWorkspaceIcon}
        selected={selectedWorkspace == null}
        border={false}
        padding="0px"
        />
    </hbox>
    <label for="workspace" class="name font-smallest">
      {$t`All`}
    </label>
  </vbox>
  {#each $workspaces.each as workspace}
    <vbox class="workspace"
      style="--workspace-color: {workspace.color};"
      on:click={event => onChange(workspace, event)}
      >
      <hbox class="button">
        <RoundButton
          label={workspace.name}
          {iconSize}
          icon={workspace.icon}
          selected={selectedWorkspace == workspace}
          border={false}
          padding="0px"
          />
      </hbox>
      <label for="workspace" class="name font-smallest">
        {workspace.name}
      </label>
    </vbox>
  {/each}
</hbox>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import { defaultWorkspaceIcon, type Workspace } from "../../../logic/Abstract/Workspace";
  import { appGlobal } from "../../../logic/app";
  import RoundButton from "../../Shared/RoundButton.svelte";

  export let selectedWorkspace: Workspace = appGlobal.workspaces.last;
  export let iconSize = "32px";

  let workspaces = appGlobal.workspaces;

  function onChange(newWorkspace: Workspace, event: Event) {
    selectedWorkspace = newWorkspace;
    event.stopPropagation();
  }
</script>

<style>
  .workspace {
    align-items: center;
    padding: 6px 20px 6px 12px;
    margin: 2px;
  }
  .button {
    /*border-radius: 100px;
    border: 2px solid var(--workspace-color);*/
  }
  .button :global(.button svg) {
    fill: var(--workspace-color);
    stroke-width: 1px;
  }
</style>
