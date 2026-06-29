<vbox flex class="device-setup" class:withVideo>
  <ErrorMessageInline {ex} />
  {#if withVideo}
    <vbox class="self-video" flex>
      <Video stream={$deviceStream?.cameraMicStream} muted={true} />
    </vbox>
  {/if}
  <hbox class="buttons">
    <slot name="buttons-left" />
    <DeviceButton video={false} {devices}
      on={$micOnSetting.value}
      selectedID={$selectedMicSetting.value}
      stream={$deviceStream?.cameraMicStream}
      on:changeOn={event => micOnSetting.value = event.detail}
      on:changeDevice={event => selectedMicSetting.value = event.detail}
      />
    {#if withVideo}
      <DeviceButton video={true} {devices}
        on={$cameraOnSetting.value}
        selectedID={$selectedCameraSetting.value}
        on:changeOn={event => cameraOnSetting.value = event.detail}
        on:changeDevice={event => selectedCameraSetting.value = event.detail}
        />
    {/if}
    <slot name="buttons-right" />
  </hbox>
</vbox>

<script lang="ts">
  import { cameraOnSetting, micOnSetting, selectedCameraSetting, selectedMicSetting } from "./selectedDevices";
  import { LocalMediaDeviceStreams } from "../../../logic/Meet/LocalMediaDeviceStreams";
  import DeviceButton from "./DeviceButton.svelte";
  import Video from "../View/Video/Video.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { onDestroy, onMount, tick } from "svelte";

  export let withVideo = true;

  let devices: MediaDeviceInfo[];

  let deviceStream: LocalMediaDeviceStreams;
  async function startCamMic() {
    deviceStream ??= new LocalMediaDeviceStreams();
    try {
      await deviceStream.setCameraMicOn(cameraOnSetting.value, micOnSetting.value, selectedCameraSetting.value, selectedMicSetting.value);
    } catch (ex) {
      if (false && ex.name == "OverconstrainedError") { // TODO prevents device list to show up at all
        await deviceStream.deviceDisconnected();
        cameraOnSetting.value = deviceStream.cameraOn ?? false;
        micOnSetting.value = deviceStream.micOn ?? false;
        if (deviceStream.cameraDevice) {
          selectedCameraSetting.value = deviceStream.cameraDevice;
        }
        if (deviceStream.micDevice) {
          selectedMicSetting.value = deviceStream.micDevice;
        }
        return;
      }
      showErrorInline(ex);
    }
    await getDevices();
  }

  async function stopCamMic() {
    await deviceStream.setCameraMicOn(false, false);
  }

  async function getDevices() {
    await tick();
    // Real device names appear only after the cam delivers an actual picture
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    devices = allDevices.filter(d => !d.label.startsWith("Monitor of"));

    navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
  }

  function onDeviceChange() {
    getDevices()
      .catch(ex2 => ex = ex2);
  }

  /* TODO loops when selecting device
  // E.g. when the selected camera was unplugged and we automatically selected another camera
  $: cameraChanged($deviceStream?.cameraDevice)
  function cameraChanged(newCamID: string) {
    if (!newCamID || newCamID == selectedCameraSetting.value) {
      return;
    }
    selectedCameraSetting.value = newCamID;
  }
  $: micChanged($deviceStream?.micDevice)
  function micChanged(newMicID: string) {
    if (!newMicID || newMicID == selectedMicSetting.value) {
      return;
    }
    selectedMicSetting.value = newMicID;
  }
  */

  onDestroy(() => {
    navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
  });

  $: ex = null, catchErrors(() => deviceStream?.setCameraMicOn($cameraOnSetting.value, $micOnSetting.value, $selectedCameraSetting.value, $selectedMicSetting.value), showErrorInline);

  let ex: Error | null = null;
  function showErrorInline(error: Error) {
    ex = error;
  }

  onMount(async () => catchErrors(startCamMic));
  onDestroy(async () => catchErrors(stopCamMic));
</script>

<style>
  .self-video {
    align-items: center;
    justify-content: center;
  }
  .withVideo .buttons {
    margin-block-start: -22px;
    justify-content: center;
    z-index: 1;
  }
  .buttons :global(> *) {
    margin-inline-start: 4px;
  }
</style>
