<hbox class="account" title={$account.fatalError ? account.fatalError.message : ""}>
  {#if $account.isLoggedIn}
    <hbox class="icon"><Icon data={AccountIcon} size="16px" /></hbox>
  {:else}
    <LoggedOutIcon size="16px" />
  {/if}
  <hbox class="label">{$account.name}</hbox>
    <hbox flex class="buttons">
      {#if $account.isLoggedIn}
        <GetMailButton folder={account.inbox} />
      {:else}
        <Button plain iconOnly icon={DisconnectedIcon} onClick={login} label={$t(`Login`)} iconSize="16px" />
      {/if}
    </hbox>
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Icon from 'svelte-icon/Icon.svelte';
  import GetMailButton from "./GetMailButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AccountIcon from '../../asset/icon/appBar/mail.svg?raw';
  import LoggedOutIcon from "lucide-svelte/icons/mail-x";
  import DisconnectedIcon from "lucide-svelte/icons/unplug";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  async function login() {
    await account.login(true);
  }
</script>

<style>
  .account {
    align-items: center;
    padding-inline-start: 12px;
    padding-block-start: 2px;
    padding-block-end: 2px;
  }
  .icon :global(path),
  .icon :global(.cls-2) {
    stroke: var(--leftpane-fg);
  }
  .label {
    margin-inline-start: 8px;
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
