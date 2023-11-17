<vbox flex class="apps-launcher">
  <vbox flex />

  <vbox class="center">
    {#each apps.each as app}
      <AppLaunchButton {app} bind:runningApp />
    {/each}

    <hbox class="actions">
      <hbox flex />
      <Button on:click={startStore} label="More apps" />
    </hbox>
  </vbox>
  <vbox flex />
</vbox>

<script lang="ts">
  import type AppListed from "../../logic/Apps/AppListed";
  import type { Collection } from "svelte-collections";
  import AppLaunchButton from "./AppLaunchButton.svelte";
  import Button from "../Shared/Button.svelte";

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
  .actions {
    margin-top: 32px;
  }
</style>
