<hbox class="empty" />
<hbox class="empty" />
<!--
<AccountButton account={appGlobal.files.get(1)} page={acc => `/files/account/${acc.id}/persons`} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.files.get(0)} page={acc => `/files/account/${acc.id}/persons`} defaultIcon={AccountIcon} />
-->

<AppButton app={filesMustangApp} page="/files/" />

<CombinedButton icon1={filesMustangApp.icon} icon2={SearchIcon} page="/files/search" />
{#if $selectedPerson}
  <CombinedButton icon1={filesMustangApp.icon} icon2={PlusIcon} page={`/files/person/${$selectedPerson?.id}/upload`} />
{:else}
  <hbox class="empty" />
{/if}

<script lang="ts">
  import { filesMustangApp } from "../../../Files/FilesMustangApp";
  import { selectedPerson } from "../../../Contacts/Person/Selected";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import AccountIcon from "lucide-svelte/icons/folder-open";
</script>
