{#if appGlobal.isMobile}
  <Route path="person/:personID/upload">
    <UploadM person={params?.person ?? $selectedPerson ?? requiredParam()} />
  </Route>
  <Route path="person/:personID/files">
    <FilesM person={params?.person ?? $selectedPerson ?? requiredParam()} />
  </Route>
  <Route path="search">
    <PersonsM selectedPerson={params?.person ?? $selectedPerson ?? requiredParam()} doSearch={true} />
  </Route>
  <Route path="file">
    <FileViewer file={params?.file ?? requiredParam()} />
  </Route>
  <Route path="/">
    <PersonsM selectedPerson={params?.person ?? $selectedPerson ?? requiredParam()} />
  </Route>
{:else}
  <Route path="file">
    <FilesAppD viewFile={params?.file ?? requiredParam()} />
  </Route>
  <Route path="/">
    <FilesAppD />
  </Route>
{/if}

<script lang="ts">
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { appGlobal } from "../../logic/app";
  import FilesAppD from "./FilesAppD.svelte";
  import FileViewer from "./FileViewer.svelte";
  import PersonsM from "./PersonsM.svelte";
  import FilesM from "./FilesM.svelte";
  import UploadM from "./UploadM.svelte";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = $location.state;
</script>
