<Splitter initialRightRatio={0.25} rightMinWidth={60}>
  <SpeakerOnly {videos} {showParticipant} {me} slot="left" />
  <Scroll slot="right">
    <vbox class="participants">
      {#each $videos.each as video (video.id)}
        <ParticipatingVideo {video} {showSelf} />
      {/each}
    </vbox>
  </Scroll>
</Splitter>

<script lang="ts">
  import type { VideoStream } from "../../../logic/Meet/VideoStream";
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import SpeakerOnly from "./SpeakerOnly.svelte";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
  import type { Collection } from "svelte-collections";

  export let videos: Collection<VideoStream>;
  export let showParticipant: MeetingParticipant;
  export let me: MeetingParticipant;
  export let showSelf: boolean;
</script>

<style>
</style>
