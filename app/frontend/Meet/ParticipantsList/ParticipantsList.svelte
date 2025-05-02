<hbox class="participants" flex>
  {#each $participants.each as participant (participant.id)}
    <ParticipantItem participant={participant} style="list" />
  {/each}
</hbox>

<script lang="ts">
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import ParticipantItem from "./ParticipantItem.svelte";
  import type { Collection } from "svelte-collections";

  export let participants: Collection<MeetingParticipant>;
</script>

<style>
  .participants {
    flex-wrap: wrap;
    margin: 0px 16px 0px 16px;
    justify-content: center;
    align-items: center;
  }
</style>
