{#if subAccounts.hasItems}
  <vbox class="subaccounts">
    <HeaderGroupBox>
      <hbox slot="header">{$t`Sub-Accounts`}</hbox>
      <!--<svelte:fragment slot="buttons-top-right">
        <RoundButton
          label={$t`List other available sub-accounts`}
          onClick={onList}
          icon={PlusIcon}
          disabled={true}
          />
      </svelte:fragment>-->
      <grid class="content">
        {#each subAccounts.each as subAccount}
          <Button
            label={subAccount.name}
            icon={getAccountIcon(subAccount)}
            onClick={() => openSettingsCategoryForAccount(subAccount)}
            plain={true}
            />
          <hbox class="type font-small">
            {getAccountMainTypeLabel(subAccount)}
          </hbox>
          <hbox class="color" style:background-color={subAccount.color} />
        {/each}
        </grid>
    </HeaderGroupBox>
  </vbox>
{/if}

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import { openSettingsCategoryForAccount } from "./Window/CategoriesUtils";
  import { getAccountIcon, getAccountMainTypeLabel } from "./Shared/accountUIHelper";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import Button from "../Shared/Button.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { t } from "../../l10n/l10n";

  export let account: Account;

  $: subAccounts = account.dependentAccounts()
    .filterObservable(acc => acc.protocol != "smtp");

  async function onList() {
    // TODO Create Account.listPossibleSubAccounts() API, which returns
    // all server resources that could be accounts, but are not yet.
    // As `Account`, but not `save()`d yet.
    // Then, show them in a list, with (+) buttons, to allow the user to add them.
    // Once the user does, set their `.mainAccount`, and `save()` them.
  }
</script>

<style>
  .subaccounts {
    max-width: 40em;
  }
  grid.content {
    grid-template-columns: 1fr  auto auto;
    column-gap: 16px;
  }
  .subaccounts :global(.button) {
    justify-content: start;
    padding-block: 4px;
    padding-inline-start: 8px;
    margin-inline-start: -8px;
  }
  .subaccounts .color {
    width: 24px;
    margin-block: 4px;
    border: solid 1px black;
  }
  .subaccounts .type {
    opacity: 60%;
    align-self: center;
  }
</style>
