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
      <hbox class="button" />
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
    margin-block-start: -4px;
    padding: 12px 16px 16px 16px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
  }
  .workspace {
    padding: 0px 8px;
  }
  /*.workspace {
    background-color: var(--workspace-color);
    color: lch(from var(--workspace-color) calc((49.44 - l) * infinity) 0 0);
  }*/
  .workspace label {
    margin-inline-start: 12px;
  }
  .workspace .button {
    background-color: var(--workspace-color);
    margin: 3px 0px;
    min-width: 18px;
    min-height: 18px;
    border-radius: 18px;
    align-self: center;
  }
  .workspace:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
</style>
