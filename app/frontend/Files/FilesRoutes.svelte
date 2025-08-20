{#if appGlobal.isMobile}
  <Route path="person/:personID/upload">
    {ensureLoaded(selectedPerson, "/files/")}
    <UploadM person={$selectedPerson} />
  </Route>
  <Route path="person/:personID/files">
    {ensureLoaded(selectedPerson, "/files/")}
    <FilesM person={$selectedPerson} />
  </Route>
  <Route path="search">
    <PersonsM selectedPerson={$selectedPerson} doSearch={true} />
  </Route>
  <Route path="/">
    <PersonsM selectedPerson={$selectedPerson} />
  </Route>
{:else}
  <Route path="/">
    <FilesAppD />
  </Route>
{/if}

<script lang="ts">
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { appGlobal } from "../../logic/app";
  import FilesAppD from "./FilesAppD.svelte";
  import PersonsM from "./PersonsM.svelte";
  import FilesM from "./FilesM.svelte";
  import UploadM from "./UploadM.svelte";
  import { ensureLoaded } from "../Util/route";
  import { Route } from "svelte-navigator";
</script>
