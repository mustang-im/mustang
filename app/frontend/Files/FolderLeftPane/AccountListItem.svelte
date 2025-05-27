<hbox class="account" title={errorMsg}
  on:contextmenu={contextMenu.onContextMenu}>
  {#if $account.isLoggedIn}
    <hbox class="icon">
      {#if account.icon && typeof(account.icon) == "string" }
        <img src={account.icon} width="18px" height="18px" alt="" class="logo" />
      {:else}
        <Icon data={MailIcon} size="16px" />
      {/if}
    </hbox>
  {:else}
    <hbox class="icon">
      <Icon data={MailXIcon} size="16px" />
    </hbox>
  {/if}
  <hbox class="label">{$account.name}</hbox>
    <hbox flex class="buttons">
      {#if $account.isLoggedIn}
        <Button
          onClick={login}
          icon={SyncIcon}
          label={$t`Sync`}
          plain iconOnly iconSize="16px"
          />
      {:else}
        <Button
          onClick={login}
          icon={DisconnectedIcon}
          label={$t`Login`}
          plain iconOnly iconSize="16px"
          />
      {/if}
    </hbox>
</hbox>

<ContextMenu bind:this={contextMenu}>
  <AccountMenu {account} />
</ContextMenu>

<script lang="ts">
  import type { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import AccountMenu from "./AccountMenu.svelte";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import MailIcon from '../../asset/icon/appBar/mail.svg?raw';
  import MailXIcon from '../../asset/icon/mail/mail-question.svg?raw';
  import DisconnectedIcon from "lucide-svelte/icons/unplug";
  import SyncIcon from "lucide-svelte/icons/folder-sync";
  import { t } from "../../../l10n/l10n";

  export let account: FileSharingAccount;

  async function login() {
    if (!account.isLoggedIn) {
      await account.login(true);
    }
    await account.sync();
  }

  let contextMenu: ContextMenu;

  $: errors = $account.errors;
  $: errorMsg = $account.fatalError
    ? account.fatalError.message
    : $errors.hasItems
      ? errors.first.message
      : "";
</script>

<style>
  .account {
    align-items: center;
    padding-inline-start: 12px;
    padding-block-start: 2px;
    padding-block-end: 2px;
  }
  .icon {
    height: 20px;
    width: 20px;
    align-items: center;
    justify-content: center;
  }
  .icon :global(path),
  .icon :global(.cls-2) {
    stroke: var(--leftpane-fg);
  }
  .logo {
    border-radius: 2px;
  }
  .label {
    margin-inline-start: 6px;
    font-weight: 300;
  }
  .account:not(:hover) .buttons {
    display: none;
  }
  .buttons {
    justify-content: end;
    margin-inline-end: 8px;
  }
  .buttons :global(button) {
    color: unset;
    background-color: unset;
    border: none;
  }
  .buttons :global(.get-mail button) {
    padding: 3px;
  }
</style>
