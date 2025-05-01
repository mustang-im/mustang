<hbox flex>
  <vbox flex class="main">
    <Gallery videos={meeting.videos} {showSelf}  />
    <InMeetingToolbar {meeting} {isSidebar} bind:showSidebar />
  </vbox>
  {#if showSidebar && !isSidebar}
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
  import Gallery from "./View/Gallery.svelte";
  import InMeetingToolbar from "./InMeetingToolbar.svelte";
  import ParticipantsSidebar from "./ParticipantsBar/Sidebar.svelte";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;

  let showSelf = true;
  let selectedParticipant: MeetingParticipant = null;
  let showSidebar = meeting.participants.length != 1;
  $: myParticipant = meeting.myParticipant;
</script>

<style>
  .main {
    flex: 3 0 0;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
  }
  .sidebar {
    min-width: 250px;
    max-width: 350px;
  }
</style>
