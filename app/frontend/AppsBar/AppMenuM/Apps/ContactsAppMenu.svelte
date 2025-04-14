<AccountButton account={appGlobal.addressbooks.get(1)} page={acc => `/contacts/account/${acc.id}/persons`} />
<AccountButton account={appGlobal.addressbooks.get(0)} page={acc => `/contacts/account/${acc.id}/persons`} />
<AppButton app={contactsMustangApp} page="/contacts/" />
<CombinedButton icon1={contactsMustangApp.icon} icon2={SearchIcon} page="/contacts/search" />
<CombinedButton icon1={contactsMustangApp.icon} icon2={PlusIcon} page="/contacts/create-person" />

<script lang="ts">
  import { contactsMustangApp } from "../../../Contacts/ContactsMustangApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
</script>
