{#if $selectedPerson}
  <VisUI start={new VisPerson($selectedPerson)} />
{:else}
  Please select a person
{/if}


<script lang="ts">
  import { VisPerson } from "./Node/VisPerson";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import VisUI from "./VisUI.svelte";
</script>
