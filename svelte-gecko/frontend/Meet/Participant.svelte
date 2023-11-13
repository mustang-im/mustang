<vbox flex class="participant">
  <Stack>
    <vbox class="video">
      <img src={participant.picture} alt={participant.name} />
    </vbox>
    <vbox flex class="name-container">
      <hbox class="name">{participant.name}</hbox>
    </vbox>
  </Stack>
</vbox>

<script lang="ts">
import type { Person } from "../../logic/Abstract/Person";
import Stack from "../Shared/Stack.svelte";

export let participant: Person;
</script>

<style>
  .name-container {
    align-items: end;
    justify-content: end;
    align-self: end;
    justify-items: end;
  }
  .name {
    color: white;
    text-shadow: 1px;
    align-items: end;
    justify-content: end;
    align-self: end;
    justify-items: end;
  }
  img {
    width: 500px;
    height: 500px;
  }
</style>
