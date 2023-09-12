<hbox flex class="participant">
  <vbox class="image">
    <img
      src={participant.picture}
      width="64" height="64"
      title="Picture of {participant.name}"
      alt="Picture of {participant.name}" />
  </vbox>
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
  import type { Person } from "../../logic/Abstract/Person";

  export let participant: Person;
</script>

<style>
</style>
