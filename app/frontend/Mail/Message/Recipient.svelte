<!-- svelte-ignore a11y-click-events-have-key-events -->
<value title={recipient.emailAddresses.first.value} on:click={selectPerson}>
  {recipient.name}
</value>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { selectedPerson } from "../../Shared/Person/PersonOrGroup";
  import { AppArea, selectedApp } from "../../MainWindow/app";

  export let recipient: Person;

  function selectPerson() {
    $selectedPerson = recipient;
    $selectedApp = AppArea.Contacts;
  }
</script>

<style>
  value {
    cursor: pointer;
  }
</style>
