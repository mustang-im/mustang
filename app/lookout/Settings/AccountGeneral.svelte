<OptionsPage icon={icon} description={$t`Change the settings of ${$account.name}.`}>
  <OptionsSection title={draft.isMailAccount ? $t`User Information` : $t`Account`}>
    <OptionsRow icon={UserIcon}>
      <grid class="fields">
        <label for="account-name">{$t`Account name:`}</label>
        <input id="account-name" class="lo-text-field" type="text" bind:value={draft.name} required />
        {#if draft.isMailAccount}
          <label for="account-realname">{$t`Your Name:`}</label>
          <input id="account-realname" class="lo-text-field" type="text" bind:value={draft.realname} />
          <label for="account-email">{$t`Email Address:`}</label>
          <input id="account-email" class="lo-text-field" type="email" bind:value={draft.emailAddress} required />
        {/if}
        <span>{$t`Account Type:`}</span>
        <span class="value">{AccountLabels.typeLabel(account)}</span>
      </grid>
    </OptionsRow>
  </OptionsSection>

  {#if mainAccount}
    <OptionsSection title={$t`Part of an account`}>
      <OptionsRow icon={MainAccountIcon}>
        <span>{$t`This is part of the account ${$mainAccount.name}, which has the server and logon settings.`}</span>
        <hbox>
          <DialogButton label={$t`Go to ${$mainAccount.name}`} onClick={() => onOpenAccount(mainAccount)} />
        </hbox>
      </OptionsRow>
    </OptionsSection>
  {/if}

  <OptionsSection title={$t`Remove account`}>
    <OptionsRow icon={RemoveIcon}>
      <span>{$t`Remove this account from ${appName}. Its content on this computer is deleted. The content on the server is not affected.`}</span>
      <hbox>
        <DialogButton label={$t`Remove Account…`} onClick={onRemove} />
      </hbox>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import type { AccountDraft } from "./Mail/Account/AccountDraft";
  import { AccountLabels } from "./Shared/AccountLabels";
  import { MessageBox } from "../Shared/Dialog/MessageBox";
  import { appGlobal } from "../../logic/app";
  import { appName } from "../../logic/build";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "../../frontend/Mail/Selected";
  import OptionsPage from "./Shared/OptionsPage.svelte";
  import OptionsSection from "./Shared/OptionsSection.svelte";
  import OptionsRow from "./Shared/OptionsRow.svelte";
  import DialogButton from "../Shared/Dialog/DialogButton.svelte";
  import UserIcon from "lucide-svelte/icons/id-card";
  import MainAccountIcon from "lucide-svelte/icons/link";
  import RemoveIcon from "lucide-svelte/icons/user-x";
  import { t } from "../../l10n/l10n";

  export let account: Account;
  export let draft: AccountDraft;
  export let icon: ConstructorOfATypedSvelteComponent;
  export let onOpenAccount: (account: Account) => void;
  export let onRemoved: (account: Account) => void;

  $: mainAccount = $account.isDependentAccount ? $account.mainAccount : null;

  async function onRemove() {
    if (!await MessageBox.ask($t`Remove account`, $t`Are you sure that you want to remove the account ${account.name} from ${appName}? All its content on this computer will be deleted. Content stored on the server will not be affected.`)) {
      return;
    }
    await account.deleteIt();
    if ($selectedAccount == account) {
      $selectedAccount = appGlobal.emailAccounts.first;
      $selectedFolder = $selectedAccount?.inbox;
      $selectedMessage = null;
      $selectedMessages?.clear();
    }
    onRemoved(account);
  }
</script>

<style>
  .fields {
    grid-template-columns: 160px minmax(200px, 360px);
    align-items: center;
    gap: 8px 12px;
  }
  .value {
    color: var(--lo-fg-secondary);
  }
</style>
