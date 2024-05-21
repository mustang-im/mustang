<Scroll>
  <vbox flex class="settings-content">
    {#if category?.windowContent}
      <svelte:component this={category.windowContent} account={$selectedAccount} />
    {/if}
  </vbox>
</Scroll>

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import { selectedAccount } from "./selected";
  import Scroll from "../../Shared/Scroll.svelte";

  export let category: SettingsCategory;
</script>

<style>
  .settings-content {
    max-width: 98%; /* HACK for account name page*/
  }
</style>
