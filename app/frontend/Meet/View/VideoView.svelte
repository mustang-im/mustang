{#if meetGalleryViews.includes(selectedView) || isSidebar}
  <Gallery {videos} view={selectedView} {showSelf} />
{:else if selectedView == MeetVideoView.Thumbnails}
  <Thumbnails {videos} {showParticipant} {me} {showSelf} />
{:else if selectedView == MeetVideoView.SpeakerOnly}
  <SpeakerOnly {videos} {showParticipant} {me} />
{/if}

<script lang="ts">
  import { VideoStream } from "../../../logic/Meet/VideoStream";
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import { meetGalleryViews, MeetVideoView } from "./ViewSelectorPopup.svelte";
  import Gallery from "./Gallery.svelte";
  import Thumbnails from "./Thumbnails.svelte";
  import SpeakerOnly from "./SpeakerOnly.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { Collection } from "svelte-collections";

  export let videos: Collection<VideoStream>;
  export let me: MeetingParticipant;
  export let showParticipant: MeetingParticipant;
  export let isSidebar = false;

  let viewSetting = getLocalStorage("meet.videoView", MeetVideoView.GalleryAutoView);
  $: selectedView = $viewSetting.value;
  let showSelfSetting = getLocalStorage("meet.showSelf", true);
  $: showSelf = $showSelfSetting.value;
</script>
