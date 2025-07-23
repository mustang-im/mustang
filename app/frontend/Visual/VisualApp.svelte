{#if $selectedPerson}
  <Vis start={new VisPerson($selectedPerson)} />
{:else}
  Please select a person
{/if}

<script lang="ts">
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { VisPerson } from "./Node/VisPerson";
  import Vis from "./Vis.svelte";
</script>
