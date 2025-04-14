{#if account}
  <hbox class="account-button">
    <RoundButton
      icon={account.icon ?? defaultIcon}
      iconSize="24px"
      classes="plain"
      border={false}
      padding="24px"
      onClick={goToAccount}
      />
    </hbox>
{:else}
  <hbox class="empty" />
{/if}

<script lang="ts">
  import { Account } from "../../../logic/Abstract/Account";
  import { goTo } from "../selectedApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AccountIcon from "lucide-svelte/icons/rabbit";
  import type { ComponentType } from 'svelte';

  export let account: Account;
  export let defaultIcon: ComponentType = AccountIcon;
  /**
   * @param account
   * @returns e.g. "/mail/folder/account45/inbox/" */
  export let page: (account: Account) => string;

  function goToAccount() {
    goTo(page(account));
  }
</script>

<style>
  .account-button {
  }
</style>
