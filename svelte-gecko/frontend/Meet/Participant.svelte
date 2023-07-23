<vbox class="participant">
  <Stack>
    <vbox class="video">
      <img src={participant.picture} alt={participant.name} />
    </vbox>
    <vbox class="name-container">
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
  .participant {
    flex: 1 0 0;
    width: 33%;
    height: 50%;
  }
  .name-container {
    flex: 1 0 0;
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
