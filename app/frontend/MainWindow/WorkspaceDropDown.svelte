<vbox class="workspace-selector">
  {#each [null, ...appGlobal.workspaces.each] as workspace}
    <hbox class="workspace"
      on:click={event => onWorkspaceSelected(workspace, event)}
      style="--workspace-color: {workspace?.color ?? "black"}"
      class:selected={workspace == $selectedWorkspace}
      >
      <!--
      <input type="radio"
        checked={workspace == $selectedWorkspace}
        value={workspace}
        name="workspace"
        on:input={event => onWorkspaceSelected(workspace, event)}
        />
      -->
      <!--<Icon data={workspace?.icon} />-->
      <label for="workspace" class="name">{workspace?.name ?? "All"}</label>
    </hbox>
  {/each}
</vbox>

<script lang="ts">
  import { Workspace } from "../../logic/Abstract/Workspace";
  import { selectedWorkspace } from "./Selected";
  import { appGlobal } from "../../logic/app";

  export let open: boolean;

  function onWorkspaceSelected(workspace: Workspace, event: Event) {
    event.stopPropagation();
    open = false;
    $selectedWorkspace = workspace;
  }
</script>

<style>
  .workspace-selector {
    padding: 4px 4px;
    border-radius: 5px;
    background-color: var(--windowheader-bg);
  }
  .workspace {
    background-color: var(--workspace-color);
    color: lch(from var(--workspace-color) calc((49.44 - l) * infinity) 0 0);
    padding: 2px 16px 2px 12px;
  }
  .workspace:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
</style>
