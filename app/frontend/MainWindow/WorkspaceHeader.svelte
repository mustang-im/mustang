{#if $selectedApp != settingsMustangApp}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <hbox class="workspace" bind:this={workspaceE}
    on:click={onWorkspaceToggle}>
    {#if $selectedWorkspace}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <hbox class="label">
        {$selectedWorkspace.name}
      </hbox>
    {:else}
      <RoundButton label={$t`Workspace`} icon={WorkspaceIcon}
        iconSize="12px" filled={false} border={false} padding="0px" classes="workspace" />
    {/if}
    <Popup bind:popupOpen={showWorkspaceDropdown} popupAnchor={workspaceE} placement="bottom-start" boundaryElSel="body">
      <WorkspaceDropDown bind:open={showWorkspaceDropdown} />
    </Popup>
  </hbox>
{/if}

<script lang="ts">
  import type { MustangApp } from "../AppsBar/MustangApp";
  import { settingsMustangApp } from "../Settings/Window/SettingsMustangApp";
  import { selectedWorkspace } from "./Selected";
  import WorkspaceDropDown from "./WorkspaceDropDown.svelte";
  import Popup from "../Shared/Popup.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import WorkspaceIcon from 'lucide-svelte/icons/circle';
  import { t } from "../../l10n/l10n";

  export let selectedApp: MustangApp;

  let workspaceE: HTMLDivElement;
  let showWorkspaceDropdown: boolean = false;
  function onWorkspaceToggle() {
    showWorkspaceDropdown = !showWorkspaceDropdown;
  }
</script>

<style>
  .workspace {
    font-size: 18px;
    align-items: center;
    padding-inline-start: 8px;
    padding-inline-end: 8px;
  }
  .workspace :global(button) {
    background-color: inherit;
    color: inherit;
  }
  .workspace:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
</style>
