<vbox class="workspace-selector">
  <vbox class="workspaces-box" class:horizontal>
    <vbox class="workspaces">
      {#each $workspaces.each as workspace}
        <hbox class="workspace"
          on:click={event => onChange(workspace, event)}
          style="background-color: {workspace.color}"
          >
          <input type="radio"
            checked={workspace == selectedWorkspace}
            value={workspace}
            name="workspace"
            on:change={event => onChange(workspace, event)}
            />
          <label for="workspace" class="name">{workspace.name}</label>
        </hbox>
      {/each}
    </vbox>
  </vbox>
  <hbox class="hint">{$t`Workspaces allow you organize yourself. You can change this at any time, by going to Settings in the title bar.`}</hbox>
</vbox>

<script lang="ts">
  import type { Workspace } from "../../../logic/Abstract/Workspace";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { appGlobal } from "../../../logic/app";
  import { t } from "../../../l10n/l10n";

  export let config: MailAccount;
  export let selectedWorkspace: Workspace = config.workspace ?? appGlobal.workspaces.last;
  export let horizontal = false;

  $: config.workspace = selectedWorkspace;
  let workspaces = appGlobal.workspaces;

  function onChange(newWorkspace: Workspace, event: Event) {
    selectedWorkspace = newWorkspace;
    event.stopPropagation();
  }
</script>

<style>
  .hint {
    font-size: 12px;
    opacity: 70%;
  }
  .workspaces-box {
    margin-inline-end: 32px;
    padding-block-start: 4px;
    margin-block-end: 16px;
  }
  .workspaces-box:not(.horizontal) {
    align-items: center;
  }
  .workspaces-box.horizontal .workspaces {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .workspace {
    padding: 6px 20px 6px 12px;
    margin: 2px;
  }
  .name {
    margin-inline-start: 8px;
    color: black;
  }
</style>
