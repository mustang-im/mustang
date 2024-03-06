<vbox flex class="apps-launcher">
  <vbox flex />

  <vbox class="center">
    <div class="apps">
      {#each $apps.each as app}
        <span class="app">
          <AppLaunchButton {app} bind:runningApp />
        </span>
      {/each}
    </div>

    <hbox class="actions">
      <hbox flex />
      <Button on:click={startStore} label="More apps" />
    </hbox>
  </vbox>
  <vbox flex />
</vbox>

<script lang="ts">
  import type AppListed from "../../../logic/Apps/AppListed";
  import AppLaunchButton from "./AppLaunchButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import type { Collection } from "svelte-collections";

  export let apps: Collection<AppListed>;
  export let runningApp: AppListed; /* in/out */
  export let showStore = false; /* in/out */

  function startStore() {
    showStore = true;
  }
</script>

<style>
  .center {
    align-self: center;
  }
  div.apps {
    flex: 1 0 0;
  }
  span.app {
    display: inline-flex;
  }
  .actions {
    margin: 32px;
  }
</style>
