<Scroll>
  <ParticipatingVideo {video} showSelf={false} />
</Scroll>

<script lang="ts">
  import { ParticipantVideo, ScreenShare, SelfVideo, type VideoStream } from "../../../logic/Meet/VideoStream";
  import type { MeetingParticipant } from "../../../logic/Meet/Participant";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { ArrayColl, type Collection } from "svelte-collections";

  export let videos: Collection<VideoStream>;
  export let showParticipant: MeetingParticipant;
  export let me: MeetingParticipant;

  let video: VideoStream;

  $: $videos, showParticipant, selectVideo();
  function selectVideo() {
    if (showParticipant) {
      if (video instanceof ParticipantVideo && video.participant == showParticipant) {
        return;
      }
      let v =
        videos.find(video =>
          video instanceof ScreenShare &&
          video.participant == showParticipant) ??
        videos.find(video =>
          video instanceof ParticipantVideo &&
          video.participant == showParticipant);
      if (v) {
        video = v;
        return;
      }
    }

    let v =
      // prefer screen share
      videos.find(video =>
        video instanceof ScreenShare &&
        video.participant != me) ??
      // if somebody is speaking, show him
      videos.find(video =>
        video instanceof ParticipantVideo &&
        video.participant.isSpeaking);
    if (v) {
      video = v;
      return;
    }

    // if we don't have any video, show the other participant, even if no audio from him
    if (!video || video instanceof SelfVideo) {
      video = videos.find(video => video instanceof ParticipantVideo);
    }
    // if I'm the only one with a video, show self
    if (!video) {
      video = videos.find(video => video instanceof SelfVideo);
    }

    // otherwise, keep the last speaker on screen
  }

  function onParticipantPropsChanged() {
    selectVideo();
  }

  // Have to manually subscribe to all participants that have a video,
  // so that we're informed when `video.participant.isSpeaker` changes.
  $: $videos, subscribeParticipants()
  let subscriptions = new ArrayColl<() => void>();
  function subscribeParticipants() {
    for (let unsubscribe of subscriptions) {
      unsubscribe();
    }
    for (let video of videos) {
      if (video instanceof ParticipantVideo) {
        subscriptions.add(video.participant.subscribe(onParticipantPropsChanged));
      }
    }
  }
</script>
