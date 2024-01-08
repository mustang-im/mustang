<hbox flex>
  <vbox flex class="main">
    <Gallery videos={meeting.videos} {showSelf}  />
    <InMeetingToolbar {meeting} {isSidebar} bind:showSidebar />
  </vbox>
  {#if showSidebar}
    <vbox flex class="sidebar">
      <ParticipantsSidebar
        {meeting}
        participants={meeting.participants}
        bind:selected={selectedParticipant}
        userIsModerator={$myParticipant?.role == ParticipantRole.Moderator}
        />
    </vbox>
  {/if}
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { ParticipantRole, type MeetingParticipant } from "../../logic/Meet/Participant";
  import Gallery from "./Gallery.svelte";
  import InMeetingToolbar from "./InMeetingToolbar.svelte";
  import ParticipantsSidebar from "./Sidebar.svelte";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;

  let showSelf = true;
  let selectedParticipant: MeetingParticipant = null;
  let showSidebar = false;
  $: myParticipant = meeting.myParticipant;
</script>

<style>
  .main {
    flex: 3 0 0;
    background-color: #494558;
  }
  .sidebar {
    min-width: 250px;
    max-width: 350px;
  }
</style>
