<hbox class="availability" class:yes class:no={!yes}>
  {yes ? "Available" : "Not available"}
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";

  export let person: Person;

  $: yes = person?.firstName.length <= 6;
</script>

<style>
  .availability {
    font-size: 12px;
    margin-top: -1px;
  }
  .availability.yes {
    color: green;
  }
  .availability.no {
    color: red;
  }
</style>
