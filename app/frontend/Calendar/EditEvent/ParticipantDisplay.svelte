<hbox flex class="participant">
  <PersonPicture person={participant} />
  <vbox flex class="right">
    <hbox class="right-top">
      <hbox flex class="name">{participant.name}</hbox>
    </hbox>
    <hbox class="right-bottom">
      Not available
    </hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";

  export let participant: Person;
</script>

<style>
</style>
