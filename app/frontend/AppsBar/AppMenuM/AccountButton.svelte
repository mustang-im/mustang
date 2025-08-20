{#if account}
  <hbox class="account-button">
    <RoundButton
      icon={account.icon ?? defaultIcon}
      iconSize="24px"
      classes="plain"
      border={false}
      padding="24px"
      onClick={() => goToAccount(account)}
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
   * Default handler for `goToAccount()`
   * @param account
   * @returns e.g. "/mail/folder/account45/inbox/" */
  export let page: (account: Account) => string | null = null;
  export let params: Record<string, any> = null;
  export let goToAccount = goToAccountDefault;

  function goToAccountDefault(account: Account) {
    params ??= { account };
    goTo(page(account), params);
  }
</script>
