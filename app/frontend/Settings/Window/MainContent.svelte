<Scroll>
  <vbox flex class="settings-content">
    {#if category?.windowContent}
      <svelte:component this={category.windowContent} account={$selectedAccount} />
    {/if}
  </vbox>
</Scroll>

<script lang="ts">
  import type { SettingsCategory } from "../SettingsCategory";
  import { getSettingsSelection } from "./selected";
  import Scroll from "../../Shared/Scroll.svelte";

  const { selectedAccount } = getSettingsSelection();

  export let category: SettingsCategory;
</script>

<style>
  .settings-content {
    max-width: 98%; /* HACK for account name page*/
  }
</style>
