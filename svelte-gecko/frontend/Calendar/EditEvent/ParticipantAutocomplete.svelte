<input bind:value={inputStr} placeholder="Add a participant or group" on:input={onInput} bind:this={inputE} />
<vbox class="results">
  {#each results.each as participant}
    <ParticipantDisplay {participant} />
  {/each}
</vbox>

<script lang="ts">
  import { ArrayColl, Collection } from "svelte-collections";
  import { appGlobal } from "../../../logic/app";
  import ParticipantDisplay from "./ParticipantDisplay.svelte";
  import type { Person } from "../../../logic/Abstract/Person";

  let inputStr: string;
  let inputE: HTMLInputElement;

  let results: Collection<Person> = new ArrayColl();

  export function onInput() {
    try {
      if (inputStr.length < 2) {
        results = new ArrayColl();
        return;
      }
      results = appGlobal.persons.filter(person => person.name.includes(inputStr));
      console.log("Got", results.length, "results for", inputStr);
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }
</script>

<style>
input {
  border-top: none;
  border-left: none;
  border-right: none;
  width: 100%;
}
</style>

