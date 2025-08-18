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

<script lang="ts">
  import { selectedPerson } from "../Contacts/Person/Selected";
  import PersonsM from "./PersonsM.svelte";
  import FilesM from "./FilesM.svelte";
  import UploadM from "./UploadM.svelte";
  import { ensureLoaded } from "../Util/svelte";
  import { Route } from "svelte-navigator";
</script>
