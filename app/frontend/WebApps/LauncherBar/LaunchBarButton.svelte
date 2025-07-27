<vbox class="app-button" class:running class:selected>
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

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { showingWebApp, webAppsRunning } from "../Runner/WebAppsRunning";
  import Button from "../../Shared/Button.svelte";
  import DotIcon from "lucide-svelte/icons/dot";

  export let app: WebAppListed;
  export let disabled = false;

  $: selected = $showingWebApp == app;
  $: running = $webAppsRunning.contains(app);

  function startApp() {
    webAppsRunning.add(app);
    $showingWebApp = app;
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
  .app-button:not(.running) .dot :global(> *) {
    display: none;
  }
  .app-button.selected .dot :global(> *) {
    display: none;
  }
</style>
