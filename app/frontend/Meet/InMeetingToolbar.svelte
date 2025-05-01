<hbox class="actions">
  {#if isSidebar}
    <RoundButton
      label={$t`Go back to meeting`}
      classes="back-to-meet"
      on:click={() => openApp(meetMustangApp)}
      icon={OpenToLeftIcon}
      iconSize="16px"
      border={false}
      />
      <hbox flex />
  {/if}
  <RoundButton
    label={$t`Screen share`}
    classes="screen-share large"
    selected={$me?.screenSharing}
    onClick={toggleScreenShare}
    icon={$me?.screenSharing ? ScreenShareIcon : ScreenShareOffIcon}
    iconSize="24px"
    border={false}
    />
  <RoundButton
    label={$t`Camera`}
    classes="camera large"
    selected={$me?.cameraOn}
    onClick={toggleCamera}
    icon={$me?.cameraOn ? CameraIcon : CameraOffIcon}
    iconSize="24px"
    border={false}
    />
  <RoundButton
    label={$t`Mute`}
    classes="mic large"
    selected={$me?.micOn}
    onClick={toggleMic}
    icon={$me?.micOn ? MicrophoneIcon : MicrophoneOffIcon}
    iconSize="24px"
    border={false}
    />
  <hbox flex />
  {#if meeting.canHandUp}
    <RoundButton
      label={$me?.handUp ? $t`Hand raised` : $t`Raise hand`}
      classes="hand large"
      selected={$me?.handUp}
      onClick={toggleHand}
      icon={$me?.handUp ? HandIcon : HandDownIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
  {#if meeting instanceof FakeMeeting}
    <RoundButton
      label={$t`Add participant`}
      classes="large"
      onClick={() => meeting.addParticipant()}
      icon={AddIcon}
      iconSize="24px"
      border={false}
      />
    <RoundButton
      label={$t`Add participant`}
      classes="large"
      onClick={() => meeting.removeParticipant()}
      icon={RemoveIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
  {#if !isSidebar}
    <RoundButton
      label={$t`Leave`}
      classes="leave large"
      onClick={leave}
      icon={LeaveIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
  <hbox flex />
  <RoundButton
    label={`Change view of participant videos`}
    classes="view-selector large"
    onClick={onShowViewSelector}
    selected={showViewSelector}
    icon={viewSelectorIcon}
    iconSize="24px"
    border={false}
    />
  <hbox bind:this={popupAnchor} />
  {#if !isSidebar}
    <RoundButton
      label={showSidebar ? $t`Close participants list` : $t`Open participants list`}
      classes="sidebar large"
      onClick={() => showSidebar = !showSidebar}
      icon={showSidebar ? CloseSidebarIcon : OpenSidebarIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
</hbox>

<Popup bind:popupOpen={showViewSelector} {popupAnchor} placement="top-end" boundaryElSel=".main">
  <ViewSelectorPopup bind:show={showViewSelector} />
</Popup>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { meetMustangApp } from "./MeetMustangApp";
  import { selectedCamera, selectedMic } from "./Setup/selectedDevices";
  import { openApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import { FakeMeeting } from "../../logic/Meet/FakeMeeting";
  import ViewSelectorPopup, { MeetVideoView as View } from "./View/ViewSelectorPopup.svelte";
  import Popup from "../Shared/Popup.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import ScreenShareIcon from "lucide-svelte/icons/screen-share-off";
  import ScreenShareOffIcon from "lucide-svelte/icons/screen-share";
  import LeaveIcon from "lucide-svelte/icons/phone";
  import OpenSidebarIcon from "lucide-svelte/icons/users-round";
  import OpenToLeftIcon from "lucide-svelte/icons/arrow-left-from-line";
  import CloseSidebarIcon from "lucide-svelte/icons/arrow-right-from-line";
  import ViewGallery2x2Icon from "lucide-svelte/icons/grid-2x2";
  import ViewThumbnailsRightIcon from "lucide-svelte/icons/panel-right";
  import ViewSpeakerOnlyIcon from "lucide-svelte/icons/square-user-round";
  import AddIcon from "lucide-svelte/icons/plus";
  import RemoveIcon from "lucide-svelte/icons/minus";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { t } from "../../l10n/l10n";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;
  export let showSidebar = false; /* in/out */

  $: me = $meeting.myParticipant;
  $: stream = $meeting.mediaDeviceStreams;

  async function leave() {
    await meeting.hangup();
    await stream.setScreenShare(false);
    await stream.setMicOn(false);
    await stream.setCameraOn(false);
    appGlobal.meetings.remove(meeting);
  }

  async function toggleHand() {
    me.handUp = !me.handUp;
  }

  async function toggleMic() {
    me.micOn = !me.micOn;
    await stream.setMicOn(me.micOn, $selectedMic);
  }

  async function toggleCamera() {
    me.cameraOn = !me.cameraOn;
    await stream.setCameraOn(me.cameraOn, $selectedCamera);
  }

  async function toggleScreenShare() {
    me.screenSharing = !me.screenSharing;
    await stream.setScreenShare(me.screenSharing);
  }

  let showViewSelector = false;
  let popupAnchor: HTMLElement;
  let viewSetting = getLocalStorage("meet.videoView", View.GalleryAutoView);
  $: selectedView = $viewSetting.value;
  $: viewSelectorIcon =
    selectedView == View.SpeakerOnly ? ViewSpeakerOnlyIcon :
    selectedView == View.Thumbnails ? ViewThumbnailsRightIcon :
    selectedView == View.Gallery3x3View ||
    selectedView == View.Gallery4x4View ||
    selectedView == View.Gallery5x5View ? ViewGallery2x2Icon :
    ViewGallery2x2Icon;
  $: console.log("show view selector", showViewSelector);

  function onShowViewSelector(event: Event) {
    event.stopPropagation();
    showViewSelector = !showViewSelector;
  }
</script>

<style>
  .actions {
    margin: 8px;
  }
  .actions :global(> *) {
    margin-inline-end: 8px;
  }
  .actions :global(> button) {
    background-color: inherit;
    color: inherit;
  }
  .actions :global(.leave svg) {
    transform: rotate(135deg);
  }
  .actions :global(.leave:hover) {
    background-color: #F34949;
  }
  .actions :global(.hand svg) {
    fill: none;
  }
  .actions :global(.hand.selected svg) {
    fill: tan;
  }
  .actions :global(.hand.selected) {
    background-color: #20AE9E;
    animation-name: color;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-direction: alternate-reverse;
        animation-timing-function: ease;
  }
  @keyframes color {
    to {
      background-color: #A3E5DD;
    }
  }
</style>
