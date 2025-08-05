<vbox flex class="device-setup">
  <vbox class="self-video" flex>
    <Video stream={cameraStream} muted={true} />
  </vbox>
  <hbox class="buttons">
    <DeviceButton video={false} {devices}
      on={$micOnSetting.value}
      selectedID={$selectedMicSetting.value}
      stream={cameraStream}
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
  import DeviceButton from "./DeviceButton.svelte";
  import Video from "../View/Video/Video.svelte";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { onDestroy, onMount, tick } from "svelte";

  let cameraStream: MediaStream;
  let devices: MediaDeviceInfo[];

  //$: $cameraOn, $micOn, $selectedCamera, $selectedMic, () => catchErrors(restartCamMic);
  $: catchErrors(() => restartCamMic($cameraOnSetting, $micOnSetting, $selectedCameraSetting, $selectedMicSetting));
  async function restartCamMic(..._dummy: any[]) {
    console.log("restart camera");
    await stopCamMic();
    await startCamMic();
  }

  async function startCamMic() {
    if (!cameraOnSetting.value && !micOnSetting.value) {
      return;
    }
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: cameraOnSetting.value ? {
        deviceId: selectedCameraSetting.value,
      } : false,
      audio: micOnSetting.value ? {
        deviceId: selectedMicSetting.value,
      } : false,
    });
    assert(cameraStream, "Failed to open camera, in device setup");

    await getDevices();
  }

  async function stopCamMic() {
    if (!cameraStream) {
      return;
    }
    for (let track of cameraStream.getTracks()) {
      track.stop();
    }
    cameraStream = null;
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
