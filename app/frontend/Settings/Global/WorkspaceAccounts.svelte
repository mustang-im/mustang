<vbox class="account-type">
  <hbox class="header">
    <hbox class="title">{title}</hbox>
    <hbox class="spacer" flex />
    <hbox class="buttons">
      <RoundButton
        label={$t`Add a new account.\nTo move an account to this workspace, find it its current workspace and click the [Move] button next to the account.`}
        icon={AddIcon}
        iconSize="10px"
        padding="3px"
        classes="small"
        onClick={onNewAccount}
        />
    </hbox>
  </hbox>
  <vbox class="accounts-list">
    {#each $accounts.each as account}
      <hbox class="account">
        <hbox class="name page-link"
          on:click={() => catchErrors(() => onOpenAccount(account))}>
          {account.name}
        </hbox>
        <hbox class="spacer" flex />
        <hbox class="buttons">
          <RoundButton
            label={$t`Open the settings of this account`}
            icon={OpenIcon}
            iconSize="10px"
            padding="3px"
            border={false}
            classes="small"
            onClick={() => onOpenAccount(account)}
            />
          {#if $workspaces.length > 1}
            <Menu position="bottom" placement="end">
              <RoundButton
                slot="control"
                label={$t`Move`}
                icon={MoveIcon}
                iconSize="10px"
                padding="3px"
                border={false}
                classes="small"
                />
              <Menu.Label>{$t`Move to workspace`}</Menu.Label>
              {#each workspaces.each as otherWorkspace}
                {#if otherWorkspace != workspace}
                <Menu.Item
                  on:click={() => catchErrors(() => onMove(account, otherWorkspace))}
                  title={$t`Move the account to this workspace`}>
                  {otherWorkspace.name}
                </Menu.Item>
                {/if}
              {/each}
            </Menu>
          {/if}
        </hbox>
      </hbox>
    {/each}
  </vbox>
</vbox>

<script lang="ts">
  import { Workspace } from "../../../logic/Abstract/Workspace";
  import { Account } from "../../../logic/Abstract/Account";
  import { settingsCategories, accountSettings } from "../SettingsCategories";
  import { selectedCategory, selectedAccount } from "../Window/selected";
  import { SetupMustangApp } from "../../Setup/SetupMustangApp";
  import { openApp } from "../../AppsBar/selectedApp";
  import { settingsMustangApp } from "../Window/SettingsMustangApp";
  import { appGlobal } from "../../../logic/app";
  import { changedWorkspace } from "./Workspaces.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import { Menu } from "@svelteuidev/core";
  import AddIcon from "lucide-svelte/icons/plus";
  import MoveIcon from "lucide-svelte/icons/arrow-down-up";
  import OpenIcon from "lucide-svelte/icons/arrow-right";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let title: string;
  export let workspace: Workspace;
  export let allAccounts: Collection<Account>;
  /** ID of settings category with `.newAccountUI`, see SettingsCategories.ts */
  export let accountSettingsID: string;

  $: accounts = $changedWorkspace && allAccounts.filter(acc => acc.workspace == workspace);
  let workspaces = appGlobal.workspaces;

  function onOpenAccount(account: Account) {
    $selectedAccount = account;
    $selectedCategory = accountSettings.find(cat => account instanceof cat.type && cat.isMain);
  }
  async function onMove(account: Account, otherWorkspace: Workspace) {
    account.workspace = otherWorkspace;
    $changedWorkspace++;
    await account.save();
  }

  function onNewAccount() {
    let newAccountUI = settingsCategories.find(cat => cat.id == accountSettingsID).newAccountUI;
    assert(newAccountUI, "newAccountUI for " + accountSettingsID + " not found");
    let setupApp = new SetupMustangApp();
    setupApp.mainWindow = newAccountUI;
    setupApp.onBack = onReOpenThis;
    openApp(setupApp);
  }

  function onReOpenThis() {
    let workspacesSettings = settingsCategories
      .find(cat => cat.id == "global")
      .subCategories
      .find(cat => cat.id == "global-workspaces");
    $selectedCategory = workspacesSettings;
    openApp(settingsMustangApp);
  }
</script>

<style>
  .account-type {
    margin: 8px 48px 8px 0px;
  }
  .header .title {
    opacity: 70%;
    font-style: italic;
    font-size: 16px;
    min-width: max-content;
  }
  .spacer {
    min-width: 12px;
  }
  .account .name {
    min-width: max-content;
  }
  .account .name {
    min-width: max-content;
    color: var(--link-fg);
  }
  .buttons {
    align-items: center;
  }
</style>
