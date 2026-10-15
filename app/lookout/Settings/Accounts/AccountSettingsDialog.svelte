<Dialog title={$t`Account Settings`}
  cancelLabel={$t`Close`}
  width="760px"
  height="560px"
  on:close>
  <vbox class="header-band">
    <span class="heading">{heading}</span>
    <span class="lo-secondary">{$t`You can add or remove an account. You can select an account and change its settings.`}</span>
  </vbox>
  <DialogTabs tabs={[
      { id: "email", label: $t`Email` },
      { id: "calendars", label: $t`Calendars` },
      { id: "addressbooks", label: $t`Address Books` },
    ]}
    bind:selected={tab} />
  <hbox class="toolbar">
    <DialogButton label={$t`New…`} icon={NewIcon} classes="plain" onClick={onNew} />
    <DialogButton label={$t`Change…`} icon={ChangeIcon} classes="plain"
      disabled={!selected && $t`Select an account first`}
      onClick={() => { changing = selected; }} />
    <DialogButton label={$t`Remove`} icon={RemoveIcon} classes="plain"
      disabled={!selected && $t`Select an account first`}
      onClick={onRemove} />
  </hbox>
  <vbox flex class="account-list" role="listbox" aria-label={heading}>
    <hbox class="list-header">
      <hbox class="column name">{$t`Name`}</hbox>
      <hbox class="column type">{$t`Type`}</hbox>
    </hbox>
    <vbox flex class="rows">
      {#each $accounts.each as account (account.id)}
        <button class="row" class:selected={account == selected}
          role="option" aria-selected={account == selected}
          on:click={() => selected = account}
          on:dblclick={() => { selected = account; changing = account; }}>
          <hbox class="column name">
            <svelte:component this={icon} size={16} />
            <span class="text">{account.name}</span>
          </hbox>
          <hbox class="column type"><span class="text">{AccountLabels.fullTypeLabel(account)}</span></hbox>
        </button>
      {:else}
        <hbox class="empty">{$t`There are no accounts of this kind yet. Click New… to add one.`}</hbox>
      {/each}
    </vbox>
  </vbox>
</Dialog>

{#if changing}
  <ChangeAccountDialog account={changing} on:close={() => changing = null} />
{/if}

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { AccountSettingsTab } from "../SettingsDialogs";
  import { appGlobal } from "../../../logic/app";
  import { appName } from "../../../logic/build";
  import { AccountLabels } from "./AccountLabels";
  import { backstageState } from "../BackstageState";
  import { SettingsDialogs } from "../SettingsDialogs";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "../../../frontend/Mail/Selected";
  import { goTo } from "../../../frontend/AppsBar/selectedApp";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import DialogTabs from "../../Shared/Dialog/DialogTabs.svelte";
  import ChangeAccountDialog from "./ChangeAccountDialog.svelte";
  import NewIcon from "lucide-svelte/icons/plus";
  import ChangeIcon from "lucide-svelte/icons/pencil";
  import RemoveIcon from "lucide-svelte/icons/x";
  import MailIcon from "lucide-svelte/icons/mail";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let tab: AccountSettingsTab = "email";

  let selected: Account = null;
  let changing: Account = null;

  $: accounts = (tab == "email"
    ? appGlobal.emailAccounts
    : tab == "calendars"
      ? appGlobal.calendars
      : appGlobal.addressbooks) as Collection<Account>;
  $: icon = tab == "email" ? MailIcon : tab == "calendars" ? CalendarIcon : AddressbookIcon;
  $: heading = tab == "email"
    ? $t`Email Accounts`
    : tab == "calendars"
      ? $t`Calendars`
      : $t`Address Books`;
  $: tab, selected = $accounts.first ?? null;

  function onNew() {
    const kSetupURLs: Record<AccountSettingsTab, string> = {
      email: "/setup/mail",
      calendars: "/setup/calendar",
      addressbooks: "/setup/contacts",
    };
    SettingsDialogs.close();
    backstageState.close();
    goTo(kSetupURLs[tab], {});
  }

  async function onRemove() {
    let account = selected;
    if (!confirm($t`Are you sure that you want to remove the account ${account.name} from ${appName}, together with all its data on this computer?`)) {
      return;
    }
    await account.deleteIt();
    if ($selectedAccount == account) {
      $selectedAccount = appGlobal.emailAccounts.first;
      $selectedFolder = $selectedAccount?.inbox;
      $selectedMessage = null;
      $selectedMessages?.clear();
    }
    selected = $accounts.first ?? null;
  }
</script>

<style>
  .header-band {
    gap: 2px;
    margin: -8px -20px 12px -20px;
    padding: 8px 20px 12px 20px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .heading {
    font-weight: 600;
  }
  .toolbar {
    flex-shrink: 0;
    gap: 4px;
    padding-block: 8px;
  }
  .account-list {
    min-height: 0;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    overflow: hidden;
  }
  .list-header {
    flex-shrink: 0;
    border-block-end: 1px solid var(--lo-divider);
    background-color: var(--lo-pane-alt-bg);
    font-size: var(--lo-font-size-small);
    font-weight: 600;
    color: var(--lo-fg-secondary);
  }
  .rows {
    min-height: 0;
    overflow-y: auto;
  }
  .row {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: default;
  }
  .row:hover {
    background-color: var(--lo-hover-bg);
  }
  .row.selected {
    background-color: var(--lo-selected-bg);
  }
  .column {
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 30px;
    padding: 0 10px;
  }
  .column.name {
    flex: 1 1 0;
  }
  .column.type {
    flex: 1.2 1 0;
    color: var(--lo-fg-secondary);
  }
  .row .column.name :global(svg) {
    flex-shrink: 0;
    color: var(--lo-accent-text);
  }
  .text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .empty {
    padding: 16px 10px;
    color: var(--lo-fg-secondary);
  }
</style>
