<vbox class="workspace-selector">
  <hbox class="hint">{$t`Workspaces allow you organize yourself. You can change this at any time, by going to Settings in the title bar.`}</hbox>

  <vbox class="workspaces-box">
    <vbox class="workspaces" class:horizontal>
      {#each workspaces as workspace}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
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
</vbox>

<script lang="ts">
  import { workspaces, type Workspace } from "../../../../logic/Abstract/Workspace";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { t } from "../../../../l10n/l10n";

  export let config: MailAccount;
  export let selectedWorkspace: Workspace = config.workspace ?? workspaces[workspaces.length - 1];
  export let horizontal = false;

  $: config.workspace = selectedWorkspace;

  function onChange(newWorkspace: Workspace, event: Event) {
    selectedWorkspace = newWorkspace;
    event.stopPropagation();
  }
</script>

<style>
  .hint {
    font-size: 12px;
  }
  .workspaces-box {
    margin-top: 6px;
    align-items: center;
    margin-right: 32px;
    padding-top: 4px;
  }
  .workspaces.horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .workspace {
    padding: 6px 20px 6px 12px;
    margin: 2px;
  }
  .name {
    margin-left: 8px;
  }
</style>
