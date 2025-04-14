<AccountButton account={appGlobal.files.get(1)} page={acc => `/files/account/${acc.id}/persons`} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.files.get(0)} page={acc => `/files/account/${acc.id}/persons`} defaultIcon={AccountIcon} />
<AppButton app={filesMustangApp} page="/files/" />
<CombinedButton icon1={filesMustangApp.icon} icon2={SearchIcon} page="/files/search" />
<CombinedButton icon1={filesMustangApp.icon} icon2={PlusIcon} page="/files/add" />

<script lang="ts">
  import { filesMustangApp } from "../../../Files/FilesMustangApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import AccountIcon from "lucide-svelte/icons/folder-open";
</script>
