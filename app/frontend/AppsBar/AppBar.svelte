<vbox class="app-bar">
  {#each $showApps.each as app}
    <AppButton on:click={() => selectedApp = app} selected={selectedApp == app}>
      <AppIcon slot="icon" icon={app.icon} size="24px" />
      <hbox slot="label" class="label">
        {app.name}
      </hbox>
    </AppButton>
  {/each}
  <vbox flex class="bottom">
  </vbox>
</vbox>

<script lang="ts">
  import type { MustangApp } from "./MustangApp";
  import type { Collection } from "svelte-collections";
  import AppButton from "./AppButton.svelte";
  import AppIcon from "./AppIcon.svelte";

  /* in/out */
  export let selectedApp: MustangApp;
  /* Which apps to show on the app bar
   * readonly */
  export let showApps: Collection<MustangApp>;
</script>

<style>
  .app-bar {
    width: 64px;
    background-color: #494558;
    box-shadow: 1px 0px 3px 0px rgba(22, 12, 39, 20%); /* #160C27 */
    padding-top: 8px;
    z-index: 4;
  }
  .app-bar :global(.app-button),
  .bottom {
    border-right: 1px dotted grey;
  }
</style>
