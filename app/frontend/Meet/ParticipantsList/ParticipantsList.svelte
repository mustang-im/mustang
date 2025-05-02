<hbox class="participants">
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
    max-height: 96px; /* 3*32px = 96px = 3 wrapping rows */
    flex-wrap: wrap;
    margin: 12px 16px 0px 16px;
    overflow: auto;
    justify-content: center;
  }
</style>
