<Scroll>
  <vbox flex class="settings-content">
    {#if categoryDebounced?.windowContent}
      <svelte:component this={categoryDebounced.windowContent} account={$selectedAccount} />
    {/if}
  </vbox>
</Scroll>

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import { selectedAccount } from "./selected";
  import Scroll from "../../Shared/Scroll.svelte";
  import { useDebounce } from "@svelteuidev/composables";

  export let category: SettingsCategory;

  // HACK to work around Svelte bug: Some vars in components are temporarily undefined
  // This caused: Settings | IMAP account | Server deletes password #777
  let categoryDebounced: SettingsCategory;
  const selectCategoryDebounced = useDebounce(selectCategory, 1);
  $: category, selectCategoryDebounced();
  function selectCategory() {
    categoryDebounced = category;
  }
</script>

<style>
  .settings-content {
    max-width: 98%; /* HACK for account name page*/
  }
</style>
