<vbox class="connectec-accounts">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Connected accounts`}</hbox>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Invite as`}</label>
        <select bind:value={account.inviteAs} name="inviteAs"
          disabled={$identities.length <= 1}>
          {#each $identities.each as identity}
            <option value={identity}>{identity.name}</option>
          {/each}
        </select>

        <label for="name">{$t`Online meeting`}</label>
        <select bind:value={account.meetAccount} name="meetAccount"
          disabled={$meetAccounts.length <= 1}>
          {#each $meetAccounts.each as meetAccount}
            <option value={meetAccount}>{meetAccount.name}</option>
          {/each}
        </select>
      </grid>
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: Calendar;

  $: identities = account.identitiesAvailable;
  $: meetAccounts = account.meetAccountsAvailable;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
