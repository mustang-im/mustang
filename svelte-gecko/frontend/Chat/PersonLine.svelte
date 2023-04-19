<vbox class="person">
  {person.name}
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Person/Person";

  export let person: Person;
</script>

<style>
  .person {
    flex: 1 0 0;
  }
</style>
