<vbox flex class="device-setup">
  <vbox class="self-video" flex>
    <Video stream={$deviceStream.cameraMicStream} muted={true} />
  </vbox>
  <hbox class="buttons">
    <DeviceButton video={false} {devices}
      on={$micOnSetting.value}
      selectedID={$selectedMicSetting.value}
      stream={$deviceStream.cameraMicStream}
      on:changeOn={event => micOnSetting.value = event.detail}
      on:changeDevice={event => selectedMicSetting.value = event.detail}
      />
    <DeviceButton video={true} {devices}
      on={$cameraOnSetting.value}
      selectedID={$selectedCameraSetting.value}
      on:changeOn={event => cameraOnSetting.value = event.detail}
      on:changeDevice={event => selectedCameraSetting.value = event.detail}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { cameraOnSetting, micOnSetting, selectedCameraSetting, selectedMicSetting } from "./selectedDevices";
  import { LocalMediaDeviceStreams } from "../../../logic/Meet/LocalMediaDeviceStreams";
  import DeviceButton from "./DeviceButton.svelte";
  import Video from "../View/Video/Video.svelte";
  import { catchErrors } from "../../Util/error";
  import { onDestroy, onMount, tick } from "svelte";

  let devices: MediaDeviceInfo[];

  let deviceStream = new LocalMediaDeviceStreams();
  async function startCamMic() {
    await deviceStream.setMicOn(micOnSetting.value, selectedMicSetting.value);
    await deviceStream.setCameraOn(cameraOnSetting.value, selectedCameraSetting.value);
    await getDevices();
  }

  async function stopCamMic() {
    await deviceStream.setMicOn(false);
    await deviceStream.setCameraOn(false);
  }

  async function getDevices() {
    if (devices) {
      return;
    }
    await tick();
    // Real device names appear only after the cam delivers an actual picture
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    devices = allDevices.filter(d => !d.label.startsWith("Monitor of"));
  }

  $: catchErrors(() => deviceStream?.setMicOn($micOnSetting.value, $selectedMicSetting.value));
  $: catchErrors(() => deviceStream?.setCameraOn($cameraOnSetting.value, $selectedCameraSetting.value));

  onMount(async () => catchErrors(startCamMic));
  onDestroy(async () => catchErrors(stopCamMic));
</script>

<style>
  .self-video {
    align-items: center;
    justify-content: center;
  }
  .buttons {
    margin-block-start: -22px;
    justify-content: center;
    z-index: 1;
  }
  .buttons :global(> *) {
    margin-inline-start: 4px;
  }
</style>
