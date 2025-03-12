<hbox class="workspace" bind:this={workspaceE}
  class:in-settings={$selectedApp == settingsMustangApp}
  class:in-settings-workspaces={$selectedApp == settingsMustangApp && $selectedCategory.id == "global-workspaces"}
  on:click={onWorkspaceToggle}>
  {#if $selectedWorkspace}
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

<script lang="ts">
  import { selectedWorkspace } from "./Selected";
  import type { MustangApp } from "../AppsBar/MustangApp";
  import { settingsMustangApp } from "../Settings/Window/SettingsMustangApp";
  import { selectedCategory } from "../Settings/Window/selected";
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
  .workspace.in-settings:not(.in-settings-workspaces) {
    display: none;
  }
  .workspace.in-settings.in-settings-workspaces {
    animation: flashColor 1s linear infinite alternate;
  }
  @keyframes flashColor {
    0% {
      background-color: var(--hover-bg);
    }
    100% {
      background-color: var(--windowheader-bg);
    }
  }
</style>
