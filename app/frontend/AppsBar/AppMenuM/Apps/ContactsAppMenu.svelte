<AccountButton account={appGlobal.addressbooks.get(1)} page={acc => `/contacts/account/${acc.id}/persons`} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.addressbooks.get(0)} page={acc => `/contacts/account/${acc.id}/persons`} defaultIcon={AccountIcon} />
<AppButton app={contactsMustangApp} page="/contacts/" />
<CombinedButton icon1={contactsMustangApp.icon} icon2={SearchIcon} page="/contacts/search" />
<CombinedButton icon1={contactsMustangApp.icon} icon2={PlusIcon} />

<script lang="ts">
  import { contactsMustangApp } from "../../../Contacts/ContactsMustangApp";
  import { selectedPerson } from "../../../Contacts/Person/Selected";
  import { goTo } from "../../selectedApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import AccountIcon from "lucide-svelte/icons/users";
  import { URLPart } from "../../../Util/util";
  import { assert } from "../../../../logic/util/util";

  function onCreatePerson() {
    assert(appGlobal.addressbooks.first, "Need an addressbook first");
    let contact = appGlobal.addressbooks.first.newPerson();
    $selectedPerson = contact;
    goTo(URLPart`/contacts/person/${contact.id}/edit`, { person: contact });
  }
</script>
