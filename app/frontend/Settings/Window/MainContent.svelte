<vbox flex class="settings-content">
  {#if category?.windowContent}
    <svelte:component this={category.windowContent} account={$selectedAccount} />
  {/if}
</vbox>

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import { selectedAccount } from "./selected";

  export let category: SettingsCategory;
</script>
