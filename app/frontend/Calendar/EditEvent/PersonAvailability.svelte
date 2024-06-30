<hbox class="availability" class:yes class:no={!yes}>
  <!--
  {yes ? "Available" : "Not available"}
  -->
</hbox>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";

  export let person: PersonUID;

  let yes = true;
</script>

<style>
  .availability {
    font-size: 12px;
    margin-block-start: -1px;
  }
  .availability.yes {
    color: green;
  }
  .availability.no {
    color: red;
  }
</style>
