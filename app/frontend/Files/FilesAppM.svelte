<Splitter name="persons-list" initialRightRatio={4}>
  <PersonsM bind:selectedPerson={$selectedPerson} slot="left" />
  <FilesM person={$selectedPerson} slot="right" />
</Splitter>

<script lang="ts">
  import { selectedPerson } from "../Contacts/Person/Selected";
  import PersonsM from "./PersonsM.svelte";
  import FilesM from "./FilesM.svelte";
  import Splitter from "../Shared/Splitter.svelte";
</script>
