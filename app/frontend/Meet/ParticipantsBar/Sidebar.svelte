<vbox flex class="participants-sidebar">
  <Time {meeting} />
  <!--MeetingNotes {meeting} /-->
  <vbox class="participants-header">
    <hbox class="number">{$participants.length} {$t`Participants`}</hbox>
  </vbox>
  <ParticipantsList {participants} bind:selected {userIsModerator} />
  <ParticipantSearch {meeting} bind:selected />
</vbox>

<script lang="ts">
  import type { MeetingParticipant } from "../../../logic/Meet/Participant";
  import type { VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import type { Collection } from "svelte-collections";
  import ParticipantsList from "./ParticipantsList.svelte";
  import ParticipantSearch from "./ParticipantSearch.svelte";
  import Time from "./Time.svelte";
  import { t } from "../../../l10n/l10n";

  export let meeting: VideoConfMeeting;
  export let participants: Collection<MeetingParticipant>;
  export let selected: MeetingParticipant;
  export let userIsModerator = false;
</script>

<style>
  .participants-sidebar {
    background-color: #494558;
    color: white;
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 46%);
  }
  .participants-header {
    align-items: center;
    margin-block-start: 12px;
  }
</style>
