<vbox class="app-bar">
  {#each $showApps.each as app}
    <AppButton selected={selectedApp == app} classes={app.id}
      on:click={() => catchErrors(() => onSelectApp(app))} >
      <AppIcon slot="icon" icon={app.icon} size="24px" />
      <hbox slot="label" class="label">
        {app.name}
      </hbox>
    </AppButton>
    <SubAppsList mainApp={app} bind:selectedApp />
  {/each}
  <vbox flex class="middle">
  </vbox>
  <vbox class="above-setup">
    <DemoToggle />
  </vbox>
</vbox>

<script lang="ts">
  import type { MustangApp } from "./MustangApp";
  import { openApp } from "./selectedApp";
  import AppButton from "./AppButton.svelte";
  import AppIcon from "./AppIcon.svelte";
  import SubAppsList from "./SubAppsList.svelte";
  import DemoToggle from "./DemoToggle.svelte";
  import { catchErrors } from "../Util/error";
  import type { Collection } from "svelte-collections";

  /* in/out */
  export let selectedApp: MustangApp;
  /* Which apps to show on the app bar
   * readonly */
  export let showApps: Collection<MustangApp>;

  function onSelectApp(app: MustangApp) {
    openApp(app, app.windowParams);
  }
</script>

<style>
  .app-bar {
    width: 64px;
    /*background-color: var(--appbar-bg); /**/
    background-color: rgba(var(--appbar-bg-rgb), 95%); /**/
    /*background-color: rgba(60, 57, 73, 90%); /**/
    /*background-color: rgba(var(--windowheader-bg-rgb), 80%); /**/
    color: var(--appbar-fg);
    box-shadow: 1px 0px 3px 0px rgba(22, 12, 39, 20%); /* #160C27 */
    padding-block-start: 8px;
    z-index: 4;
  }
  .app-bar :global(.app-button),
  .middle {
    border-right: 1px dotted var(--border);
  }
  @media (prefers-color-scheme: light) {
    .app-bar :global(.app-button),
    .middle {
      border-right: 1px dotted grey;
    }
  }
  .above-setup {
    position: fixed;
    width: 63px;
    bottom: 68px;
    margin: 0 auto;
  }
  .app-bar :global(.app-button.settings) {
    position: fixed;
    width: 63px;
    bottom: 10px;
    margin: 0 auto;
  }
  .app-bar :global(.app-button.settings:not(.selected) .label .label) {
    display: none;
  }
</style>
