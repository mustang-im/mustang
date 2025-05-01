<vbox flex class="participants-list font-normal">
  <PersonsList
    persons={$participantsSorted}
    bind:selected
    showSearch={false}
    pictureSize={24}>
    <ParticipantListItem
      slot="top-right"
      let:person participant={person instanceof MeetingParticipant ? person : null}
      {userIsModerator}
      />
  </PersonsList>
</vbox>

<script lang="ts">
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import ParticipantListItem from "./ParticipantListItem.svelte";
  import PersonsList from "../../Contacts/Person/PersonsList.svelte";
  import type { Collection } from "svelte-collections";

  export let participants: Collection<MeetingParticipant>;
  export let selected: MeetingParticipant;
  export let userIsModerator = false;

  $: participantsSorted = $participants
    .sortBy(person => person.role)
    .sortBy(person => person.handUp)
    .sortBy(person => person.screenSharing);
</script>

<style>
  .participants-list {
    margin: 8px 0;
  }
  .participants-list :global(.person .main) {
    justify-content: center;
    padding: 0 12px 0 8px;
  }
  .participants-list :global(.person .name) {
    align-items: center;
  }
  .participants-list :global(.person .avatar) {
    margin: 2px 4px 2px 24px;
  }
</style>
