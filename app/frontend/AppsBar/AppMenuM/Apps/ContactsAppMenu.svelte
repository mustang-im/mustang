<AccountButton account={appGlobal.addressbooks.get(1)} {goToAccount} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.addressbooks.get(0)} {goToAccount} defaultIcon={AccountIcon} />
<AppButton app={contactsMustangApp} page="/contacts/" />
<CombinedButton icon1={contactsMustangApp.icon} icon2={SearchIcon} page="/contacts/search" />
<CombinedButton icon1={contactsMustangApp.icon} icon2={PlusIcon} page="/contacts/create-person" />

<script lang="ts">
  import { contactsMustangApp } from "../../../Contacts/ContactsMustangApp";
  import { Addressbook } from "../../../../logic/Contacts/Addressbook";
  import { goTo } from "../../selectedApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import AccountIcon from "lucide-svelte/icons/users";

  function goToAccount(account: Addressbook) {
    goTo(`/contacts/account/${account.id}/persons`);
  }
</script>
