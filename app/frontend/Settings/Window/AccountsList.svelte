{#if $accounts.hasItems || category.newAccountUI}
  <vbox class="accounts" app={category.id}>
    <hbox class="header">
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
  import { SetupMustangApp } from "../Setup/SetupMustangApp";
  import { openApp } from "../../AppsBar/selectedApp";
  import AccountItem from "./AccountItem.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import { assert } from "../../../logic/util/util";
  import { t } from "svelte-i18n-lingui";

  /** in */
  export let category: SettingsCategory;

  $: accounts = category.accounts;

  function onNewAccount() {
    let setupApp = new SetupMustangApp();
    setupApp.mainWindow = category.newAccountUI;
    assert(setupApp.mainWindow, "Need newAccountUI");
    openApp(setupApp);
  }
</script>

<style>
  .accounts {
    justify-content: start;
    flex-wrap: wrap;
    margin: 0px 0px 0px 12px;
  }
  .accounts[app="webapps"] {
    margin-top: 128px;
  }
  .header {
    align-items: center;
    font-size: 12px;
    color: darkgray;
    margin-left: 22px;
    margin-right: 12px;
  }
  .header :global(button) {
    margin: 1px;
  }
</style>
