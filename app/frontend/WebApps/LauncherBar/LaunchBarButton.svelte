<vbox class="app-button">
  <Button
    label={app.nameTranslated}
    onClick={startApp}
    selected={$showingWebApp == app}
    {disabled}
    iconOnly plain>
    <vbox class="icon" slot="icon">
      <img src={app.icon} width="32" height="32" alt="" />
    </vbox>
  </Button>
</vbox>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import Button from "../../Shared/Button.svelte";
  import { showingWebApp, webAppsRunning } from "../Runner/WebAppsRunning";

  export let app: WebAppListed;
  export let disabled = false;

  function startApp() {
    webAppsRunning.add(app);
    $showingWebApp = app;
  }
</script>

<style>
  .app-button :global(button.plain) {
    padding: 8px;
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
</style>
