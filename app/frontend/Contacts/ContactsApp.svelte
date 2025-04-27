<Splitter name="persons-list" initialRightRatio={4}>
  <PersonsM slot="left" />
  <PersonM person={$selectedPerson} slot="right" />
</Splitter>

<script lang="ts">
  import { selectedPerson } from "./Person/Selected";
  import PersonM from "./PersonM.svelte";
  import PersonsM from "./PersonsM.svelte";
  import Splitter from "../Shared/Splitter.svelte";
</script>
