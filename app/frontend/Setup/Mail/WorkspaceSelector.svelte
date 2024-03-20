<vbox class="workspaces">
  <hbox class="header">Is it a work or private account?</hbox>

  {#each workspaces as workspace}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <hbox class="workspace" on:click={event => onChange(workspace, event)}>
      <input type="radio"
        checked={workspace == selectedWorkspace}
        value={workspace}
        name="workspace"
        on:change={event => onChange(workspace, event)}
        />
      <label for={workspace} class="name">{workspace}</label>
    </hbox>
  {/each}
</vbox>

<script lang="ts">
  export let selectedWorkspace: string = "Other";

  let workspaces = [ "Work", "Private", "Other" ];

  function onChange(newWorkspace: string, event: Event) {
    selectedWorkspace = newWorkspace;
    event.stopPropagation();
  }
</script>

<style>
  .workspaces {
    margin-top: 24px;
  }
  .header {
    margin-bottom: 4px;
  }
  .name {
    margin-left: 8px;
  }
</style>
