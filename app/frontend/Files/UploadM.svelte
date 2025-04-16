<vbox flex class="pane">
  Upload TODO
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";

  export let person: Person;
</script>

<style>
  .pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
