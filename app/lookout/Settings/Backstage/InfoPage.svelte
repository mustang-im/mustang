<vbox class="info-page">
  <h1>{$t`Account Information`}</h1>

  <button class="account-chooser" bind:this={chooserEl}
    aria-haspopup="menu" aria-expanded={isChooserOpen}
    disabled={$emailAccounts.isEmpty}
    on:click|stopPropagation={() => isChooserOpen = !isChooserOpen}>
    <hbox class="account-icon"><AccountIcon size={28} strokeWidth={1.5} /></hbox>
    {#if account}
      <vbox flex class="account-names">
        <span class="account-address">{$account.emailAddress || $account.name}</span>
        <span class="account-type">{AccountLabels.typeLabel(account)}</span>
      </vbox>
    {:else}
      <vbox flex class="account-names">
        <span class="account-address">{$t`No email account`}</span>
      </vbox>
    {/if}
    <ChevronDownIcon size={16} />
  </button>
  <Menu bind:isMenuOpen={isChooserOpen} anchor={chooserEl} placement="bottom-start">
    {#each $emailAccounts.each as mailAccount (mailAccount.id)}
      <MenuItem label={mailAccount.emailAddress || mailAccount.name}
        tooltip={AccountLabels.typeLabel(mailAccount)}
        icon={AccountIcon} checked={mailAccount == account}
        onClick={() => chosenAccount = mailAccount} />
    {/each}
    <MenuDivider />
    <MenuItem label={$t`Add Account`} icon={AddIcon} onClick={onAddAccount} />
  </Menu>

  <hbox class="add-row">
    <button class="add-account" on:click={() => catchErrors(onAddAccount)}>
      <AddIcon size={16} />
      {$t`Add Account`}
    </button>
  </hbox>

  <vbox class="tiles">
    <BackstageTile icon={AccountSettingsIcon} label={$t`Account Settings`}
      title={$t`Account Settings`}
      description={$t`Change settings for this account or set up more connections.`}>
      <MenuItem label={$t`Account Settings…`} icon={AccountSettingsIcon}
        tooltip={$t`Add and remove accounts or change existing connection settings.`}
        onClick={() => SettingsDialogs.open({ kind: "account-settings", tab: "email" })} />
      <MenuItem label={$t`Account Name and Sync Settings`} icon={AccountNameIcon}
        tooltip={$t`Update basic settings such as account name and your name.`}
        disabled={!account}
        onClick={() => SettingsDialogs.open({ kind: "change-account", account, page: "general" })} />
      <MenuItem label={$t`Server Settings`} icon={ServerIcon}
        tooltip={$t`Update logon information, such as server name, port and encryption settings.`}
        disabled={!account}
        onClick={() => SettingsDialogs.open({ kind: "change-account", account, page: "server" })} />
    </BackstageTile>

    <BackstageTile icon={RulesIcon} label={$t`Manage Rules & Alerts`}
      title={$t`Rules and Alerts`}
      description={$t`Use Rules and Alerts to help organize your incoming email messages, and receive updates when items are added, changed, or removed.`}
      disabled={!account && $t`Add an email account first`}
      onClick={() => MessageActions.openRules(account)} />
  </vbox>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { appGlobal } from "../../../logic/app";
  import { SettingsDialogs } from "../SettingsDialogs";
  import { AccountLabels } from "../Accounts/AccountLabels";
  import { MessageActions } from "../../Mail/MessageActions";
  import { selectedAccount } from "../../../frontend/Mail/Selected";
  import { catchErrors } from "../../../frontend/Util/error";
  import BackstageTile from "./BackstageTile.svelte";
  import Menu from "../../Shared/Menu/Menu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import AccountIcon from "lucide-svelte/icons/mail";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import AddIcon from "lucide-svelte/icons/plus";
  import AccountSettingsIcon from "lucide-svelte/icons/user-cog";
  import AccountNameIcon from "lucide-svelte/icons/id-card";
  import ServerIcon from "lucide-svelte/icons/server-cog";
  import RulesIcon from "lucide-svelte/icons/list-filter";
  import { t } from "../../../l10n/l10n";

  const emailAccounts = appGlobal.emailAccounts;

  let chooserEl: HTMLButtonElement;
  let isChooserOpen = false;
  let chosenAccount: MailAccount = null;
  $: account = chosenAccount && $emailAccounts.contains(chosenAccount)
    ? chosenAccount
    : $selectedAccount && $emailAccounts.contains($selectedAccount)
      ? $selectedAccount
      : $emailAccounts.first;

  function onAddAccount() {
    SettingsDialogs.open({ kind: "add-account" });
  }
</script>

<style>
  .info-page {
    max-width: 760px;
    padding: 24px 40px;
  }
  h1 {
    margin: 0 0 16px 0;
    font-size: 28px;
    font-weight: 300;
  }
  .account-chooser {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 560px;
    min-height: 52px;
    padding: 6px 12px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .account-chooser:hover:not(:disabled) {
    border-color: var(--lo-border-strong);
  }
  .account-chooser[aria-expanded="true"] {
    border-color: var(--lo-accent);
  }
  .account-icon {
    color: var(--lo-accent-text);
  }
  .account-names {
    min-width: 0;
  }
  .account-address {
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .account-type {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  .add-row {
    margin-block: 8px 12px;
  }
  .add-account {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .add-account :global(svg) {
    color: var(--lo-accent-text);
  }
  .add-account:hover {
    background-color: var(--lo-hover-bg);
  }
</style>
