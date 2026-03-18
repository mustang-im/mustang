<hbox flex>
  <vbox flex class="main">
    <VideoView {videos} {me} showParticipant={selectedParticipant} {isSidebar} />
    <AudioPlayStreams {audioOnlyStreams} />
    <InMeetingToolbar {meeting} {isSidebar} bind:showSidebar />
  </vbox>
  {#if showSidebar && !isSidebar}
    <vbox flex class="sidebar">
      <ParticipantsSidebar
        {meeting}
        participants={meeting.participants}
        bind:selected={selectedParticipant}
        userIsModerator={$me?.role == ParticipantRole.Moderator}
        />
    </vbox>
  {/if}
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { ParticipantRole, type MeetingParticipant } from "../../logic/Meet/Participant";
  import VideoView from "./View/VideoView.svelte";
  import AudioPlayStreams from "./View/Audio/AudioPlayStreams.svelte";
  import InMeetingToolbar from "./InMeetingToolbar.svelte";
  import ParticipantsSidebar from "./ParticipantsBar/Sidebar.svelte";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;

  let selectedParticipant: MeetingParticipant = null;
  $: me = meeting.myParticipant;
  $: allStreams = meeting.videos;
  $: videos = $allStreams.filterObservable(video => video.hasVideo || video.isScreenShare);
  $: audioOnlyStreams = $allStreams.filterObservable(video => !video.hasVideo && !video.isMe);

  // Show sidebar only when there are no participants, and
  // close it when the first person joins
  let showSidebar = meeting.participants.length == 0;
  $: participants = meeting.participants;
  let previousParticipantCount = 0;
  $: participantsCountChanged($participants.length);
  function participantsCountChanged(newCount: number) {
    if (previousParticipantCount == 0 && newCount > 0) {
      showSidebar = false;
    }
    previousParticipantCount = newCount;
  }
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
