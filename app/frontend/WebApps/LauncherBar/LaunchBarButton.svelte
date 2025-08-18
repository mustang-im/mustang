<vbox class="app-button" class:running class:selected
  on:contextmenu={contextMenu.onContextMenu}>
  <Button
    label={app.nameTranslated}
    onClick={startApp}
    {selected}
    {disabled}
    iconOnly plain>
    <hbox class="icon" slot="icon">
      <vbox class="dot">
        <DotIcon size={32} />
      </vbox>
      <img src={app.icon} width="32" height="32" alt="" />
    </hbox>
  </Button>
</vbox>

<ContextMenu bind:this={contextMenu}>
  {#if running}
    <MenuItem
      onClick={closeApp}
      label={$t`Close` + " " + app.nameTranslated}
      icon={CloseIcon} />
  {/if}
</ContextMenu>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { showingWebApp, selectedWebApp, webAppsRunning } from "../Runner/WebAppsRunning";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import DotIcon from "lucide-svelte/icons/dot";
  import CloseIcon from "lucide-svelte/icons/square-x";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import { t } from "../../../l10n/l10n";

  export let app: WebAppListed;
  export let disabled = false;

  $: selected = $showingWebApp == app;
  $: running = $webAppsRunning.contains(app);
  let contextMenu: ContextMenu;

  function startApp() {
    webAppsRunning.add(app);
    $showingWebApp = $selectedWebApp = app;
  }

  function closeApp() {
    webAppsRunning.remove(app);
    if ($showingWebApp == app) {
      $showingWebApp = webAppsRunning.last;
    }
    if ($selectedWebApp == app) {
      $selectedWebApp = webAppsRunning.last;
    }
  }
</script>

<style>
  .app-button :global(button.plain) {
    border-radius: 0px;
  }
  .app-button :global(button:not(.selected):hover) {
    background-color: rgba(255, 255, 255, 25%);
  }
  .app-button :global(button:not(.selected):hover .label) {
    color: black;
  }
  .app-button :global(button.selected:not(.disabled)) {
    background-color: rgba(255, 255, 255, 95%);
  }
  .app-button :global(button.selected:not(.disabled) .label > .label) {
    color: black;
  }
  /*.app-button :global(button.disabled) {
    opacity: unset;
  }*/
  .icon {
    padding: 8px 8px 8px 0px;
  }
  .dot {
    justify-content: center;
    align-items: center;
    width: 8px;
    color: var(--appbar-fg);
    margin-inline-start: 2px;
    margin-inline-end: 3px;
  }
  .selected .dot {
    color: var(--appbar-bg);
  }
  .app-button:not(.running) .dot :global(> *) {
    display: none;
  }
</style>
