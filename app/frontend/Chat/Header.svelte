<hbox class="persons-toolbar">
  <AccountSelectorRound bind:selectedAccount {accounts} iconDefault={ChatIcon} />
  <hbox flex />
  <hbox class="buttons">
    {#if !$selectedAccount?.isLoggedIn}
      <RoundButton
        label={$t`Login`}
        icon={LoginIcon}
        classes="small"
        iconSize="12px"
        onClick={() => $selectedAccount.login(true)}
        />
    {/if}
    <!--
    <RoundButton
      label={$t`New group`}
      icon={NewGroupIcon}
      iconSize="22px"
      padding="9px
      classes="large create"
      on:click={() => catchErrors(addGroup)}
      />
    -->
  </hbox>
</hbox>

<script lang="ts">
  import type { ChatAccount } from "../../logic/Chat/ChatAccount";
  import AccountSelectorRound from "../Shared/AccountSelectorRound.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewGroupIcon from "lucide-svelte/icons/plus";
  import ChatIcon from "lucide-svelte/icons/message-square-text";
  import LoginIcon from "lucide-svelte/icons/key-round";
  import { NotImplemented } from "../../logic/util/util";
  import { Collection } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let accounts: Collection<ChatAccount>;
  export let selectedAccount: ChatAccount;

  function addGroup() {
    throw new NotImplemented("Creating chat groups is not yet implemented");
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: center;
  }
</style>
