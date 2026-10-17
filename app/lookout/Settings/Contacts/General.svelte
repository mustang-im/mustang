<OptionsPage icon={PeopleIcon} description={$t`Change how you work with your contacts.`}>
  <OptionsSection title={$t`Address books`}>
    <OptionsRow icon={AddressbookIcon}>
      <vbox class="accounts">
        {#each $addressbooks.each as addressbook (addressbook.id)}
          <AccountListRow account={addressbook} icon={AddressbookIcon} onManage={onOpenAccount} />
        {:else}
          <span class="lo-secondary">{$t`There are no address books yet.`}</span>
        {/each}
      </vbox>
      <hbox>
        <DialogButton label={$t`Add Address Book…`} icon={AddIcon} onClick={onAddAccount} />
      </hbox>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import { appGlobal } from "../../../logic/app";
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import AccountListRow from "./AccountListRow.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import PeopleIcon from "lucide-svelte/icons/users";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import AddIcon from "lucide-svelte/icons/plus";
  import { t } from "../../../l10n/l10n";

  export let onOpenAccount: (account: Account) => void;
  export let onAddAccount: () => void;

  const addressbooks = appGlobal.addressbooks;
</script>

<style>
  .accounts {
    max-width: 520px;
  }
</style>
