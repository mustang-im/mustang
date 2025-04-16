{#if $accounts.hasItems || category.newAccountUI}
  <vbox class="accounts" app={category.id}>
    <hbox class="header font-smallest">
      {$t`Accounts`}
      <hbox flex />
      {#if category.newAccountUI}
        <RoundButton
          icon={AddIcon}
          iconSize="10px"
          padding="3px"
          classes="small"
          label={$t`New account for ${category.name}`}
          on:click={onNewAccount}
          />
      {/if}
    </hbox>
    {#each $accounts.each as account}
      <AccountItem {account} {category} />
    {/each}
  </vbox>
{/if}

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import { openApp } from "../../AppsBar/selectedApp";
  import { selectedCategory } from "./selected";
  import { SetupMustangApp } from "../../Setup/SetupMustangApp";
  import { settingsMustangApp } from "./SettingsMustangApp";
  import AccountItem from "./AccountItem.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  /** in */
  export let category: SettingsCategory;

  $: accounts = category.accounts;

  function onNewAccount() {
    assert(category.newAccountUI, "Need newAccountUI");
    let setupApp = new SetupMustangApp();
    setupApp.mainWindow = category.newAccountUI;
    setupApp.onBack = onReOpenThis;
    openApp(setupApp);
  }

  function onReOpenThis() {
    $selectedCategory = category;
    openApp(settingsMustangApp);
  }
</script>

<style>
  .accounts {
    justify-content: start;
    flex-wrap: wrap;
    margin: 0px 0px 0px 12px;
  }
  .accounts[app="webapps"] {
    margin-block-start: 128px;
  }
  .header {
    align-items: center;
    color: darkgray;
    margin-inline-start: 22px;
    margin-inline-end: 12px;
  }
  .header :global(button) {
    margin: 1px;
  }
</style>
