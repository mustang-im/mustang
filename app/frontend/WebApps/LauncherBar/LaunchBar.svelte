<vbox class="launch-bar">
  <hbox class="actions top">
    {#if $showingWebApp}
      <Button
        on:click={closeApp}
        icon={CloseIcon}
        iconSize="24px"
        iconOnly
        plain
        disabled={showStore}
        label={$t`Close` + " " + $showingWebApp.nameTranslated}
        classes="close-app"
        />
    {:else}
      <hbox class="button-placeholder" />
    {/if}
  </hbox>
  <hbox flex />

  {#each $apps.each as app}
    <AppLaunchButton {app} />
  {/each}

  <hbox flex />
  <hbox class="actions bottom">
    <Button
      on:click={startStore}
      icon={AddIcon}
      iconSize="32px"
      iconOnly
      plain
      disabled={showStore}
      label={$t`Add apps`}
      classes="add-app"
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { selectedWebApp, showingWebApp, webAppsRunning } from "../Runner/WebAppsRunning";
  import AppLaunchButton from "./LaunchBarButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import CloseIcon from "lucide-svelte/icons/square-x";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let apps: Collection<WebAppListed>;
  export let showStore = false; /* in/out */

  $: $showingWebApp && closeStore()
  function closeStore() {
    showStore = false;
  }

  function startStore() {
    showStore = true;
    $showingWebApp = null;
  }

  function closeApp() {
    webAppsRunning.remove($showingWebApp);
    $showingWebApp = webAppsRunning.last;
    $selectedWebApp = webAppsRunning.last;
  }
</script>

<style>
  .launch-bar {
    overflow-y: auto;
    width: 54px;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
    /*
    background-image:
      linear-gradient(var(--appbar-bg), var(--appbar-bg)),
      linear-gradient(#FFFFFF10, #FFFFFF10);
    background-blend-mode: overlay;
    background-color: unset;*/
  }
  .actions {
    margin-block-end: 6px;
  }
  .actions :global(button.plain) {
    color: inherit;
    border-radius: 0px;
    width: 100%;
    padding-block: 8px;
  }
  .actions :global(button.close-app) {
    color: red;
  }
  .button-placeholder {
    height: 40px;
  }
  .launch-bar {
    border-right: 1px dotted var(--border);
  }
  @media (prefers-color-scheme: light) {
    .launch-bar {
      border-right: 1px dotted grey;
    }
  }
</style>
