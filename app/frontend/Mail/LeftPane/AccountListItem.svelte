<hbox class="account" title={$account.fatalError ? account.fatalError.message : ""}>
  {#if $account.isLoggedIn}
    <hbox class="icon"><Icon data={AccountIcon} size="16px" /></hbox>
  {:else}
    <LoggedOutIcon size="16px" />
  {/if}
  <hbox class="label">{$account.name}</hbox>
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Icon from 'svelte-icon/Icon.svelte';
  import AccountIcon from '../../asset/icon/appBar/mail.svg?raw';
  import LoggedOutIcon from "lucide-svelte/icons/mail-x";

  export let account: MailAccount;
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
</style>
