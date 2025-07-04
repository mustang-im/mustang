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
  {:else}
    <RoundButton
      label={$t`Screen share`}
      classes="screen-share large"
      selected={$me?.screenSharing}
      onClick={toggleScreenShare}
      icon={$me?.screenSharing ? ScreenShareIcon : ScreenShareOffIcon}
      iconSize="24px"
      border={false}
      />
    <SelectScreenShare bind:this={selectScreenShare} />
  {/if}
  <DeviceButton video={true} {devices}
    on={$me?.cameraOn}
    selectedID={$selectedCameraSetting.value}
    on:changeOn={event => catchErrors(() => changeCameraOn(event.detail))}
    on:changeDevice={event => catchErrors(() => changeCameraSelected(event.detail))}
    stream={$stream.cameraMicStream}
    />
  <DeviceButton video={false} {devices}
    on={$me?.micOn}
    selectedID={$selectedMicSetting.value}
    on:changeOn={event => catchErrors(() => changeMicOn(event.detail))}
    on:changeDevice={event => catchErrors(() => changeMicSelected(event.detail))}
    stream={$stream.cameraMicStream}
    />
  {#if !isSidebar}
    <hbox class="participants" flex>
      <Scroll>
        <ParticipantsList participants={participantsWithoutVideo} />
      </Scroll>
    </hbox>
    <RoundButton
      label={$t`Leave`}
      classes="leave large"
      onClick={leave}
      icon={LeaveIcon}
      iconSize="24px"
      border={false}
      />
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
    <hbox class="sidebar-button">
      <RoundButton
        label={showSidebar ? $t`Close participants list` : $t`Open participants list`}
        classes="sidebar large"
        onClick={() => showSidebar = !showSidebar}
        icon={showSidebar ? CloseSidebarIcon : OpenSidebarIcon}
        iconSize="24px"
        border={false}
        />
      {#if !showSidebar}
        <hbox class="participants-count">
          {$participants.length}
        </hbox>
      {/if}
    </hbox>
  {/if}
</hbox>

<Popup bind:popupOpen={showViewSelector} {popupAnchor} placement="top-end" boundaryElSel=".main">
  <ViewSelectorPopup bind:show={showViewSelector} videoCount={meeting.videos?.length ?? 0} />
</Popup>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { meetMustangApp } from "./MeetMustangApp";
  import { selectedCameraSetting, selectedMicSetting, cameraOnSetting, micOnSetting } from "./Setup/selectedDevices";
  import { openApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import { FakeMeeting } from "../../logic/Meet/FakeMeeting";
  import ParticipantsList from "./ParticipantsList/ParticipantsList.svelte";
  import DeviceButton from "./Setup/DeviceButton.svelte";
  import SelectScreenShare from "./SelectScreenShare.svelte";
  import ViewSelectorPopup, { MeetVideoView as View } from "./View/ViewSelectorPopup.svelte";
  import Popup from "../Shared/Popup.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Scroll from "../Shared/Scroll.svelte";
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
  import { catchErrors } from "../Util/error";
  import { t } from "../../l10n/l10n";
  import { tick } from "svelte";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;
  export let showSidebar = false; /* in/out */

  $: me = $meeting.myParticipant;
  $: stream = $meeting.mediaDeviceStreams;
  $: participants = meeting.participants;
  $: participantsWithoutVideo = selectedView == View.SpeakerOnly ? participants :
      $participants.filter(p => !meeting.videos.find(video =>
        video.hasVideo && !video.isScreenShare && video.participant == p));

  let meInited = false;
  $: me && stream && catchErrors(() => meInit())
  async function meInit() {
    if (meInited) {
      return;
    }
    meInited = true;
    me.cameraOn = cameraOnSetting.value;
    me.micOn = micOnSetting.value;
    await stream.setMicOn(me.micOn, selectedMicSetting.value);
    await stream.setCameraOn(me.cameraOn, selectedCameraSetting.value);
    await getDevices();
  }

  let devices: MediaDeviceInfo[];
  async function getDevices() {
    if (devices) {
      return;
    }
    await tick();
    // Real device names appear only after the cam delivers an actual picture
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    devices = allDevices.filter(d => !d.label.startsWith("Monitor of"));
  }

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

  async function changeMicOn(on: boolean) {
    me.micOn = on;
    await stream.setMicOn(me.micOn, selectedMicSetting.value);
    micOnSetting.value = me.micOn;
  }

  async function changeMicSelected(deviceID: string) {
    selectedMicSetting.value = deviceID;
    await stream.setMicOn(me.micOn, deviceID);
  }

  async function changeCameraOn(on: boolean) {
    me.cameraOn = on;
    await stream.setCameraOn(me.cameraOn, selectedCameraSetting.value);
    cameraOnSetting.value = me.cameraOn;
  }

  async function changeCameraSelected(deviceID: string) {
    selectedCameraSetting.value = deviceID;
    await stream.setCameraOn(me.cameraOn, deviceID);
  }

  let selectScreenShare: SelectScreenShare;
  async function toggleScreenShare() {
    me.screenSharing = !me.screenSharing;
    if (me.screenSharing) {
      startScreenSharing()
        .catch(onScreenSharingError);
    } else {
      await stream.setScreenShare(false);
    }
  }

  async function startScreenSharing() {
    await selectScreenShare.openSelector(onScreenSharingError);
    await stream.setScreenShare(true);
    await selectScreenShare.closeSelector();
  }

  async function onScreenSharingError(ex: Error) {
    console.error(ex);
    await selectScreenShare.closeSelector();
    await stream.setScreenShare(false);
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
  .actions :global(button) {
    background-color: inherit;
    color: inherit;
  }
  .actions :global(.device-button button.button.border) {
    border: 2px solid transparent;
  }
  .participants {
    margin-block: -1px;
  }
  .actions :global(.leave svg) {
    margin-top: 3px;
    margin-bottom: -3px;
  }
  .actions :global(.leave svg) {
    transform: rotate(135deg);
  }
  .actions :global(.leave:hover) {
    background-color: #F34949;
  }
  .participants-count {
    align-items: center;
    margin-inline-start: -6px;
    min-width: 20px;
  }
  .sidebar-button:hover .participants-count {
    visibility: hidden;
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
