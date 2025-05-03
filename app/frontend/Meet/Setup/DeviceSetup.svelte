<vbox flex class="device-setup">
  <vbox class="self-video" flex>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} muted />
  </vbox>
  <hbox class="buttons">
    <DeviceButton video={false} {devices}
      on={$micOnSetting.value}
      selectedID={$selectedMicSetting.value}
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
  import { catchErrors } from "../../Util/error";
  import { onDestroy, onMount, tick } from "svelte";
  import DeviceButton from "./DeviceButton.svelte";

  let cameraStream: MediaStream;
  let videoEl: HTMLVideoElement;
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
    if (!cameraStream || !videoEl) {
      return;
    }
    videoEl.srcObject = cameraStream;
    try {
      await videoEl.play();
    } catch (ex) {
      if (ex?.message?.includes("https://goo.gl/LdLk22")) {
        console.error(ex);
        // ignore
      } else {
        throw ex;
      }
    }

    await getDevices();
  }

  async function stopCamMic() {
    if (!cameraStream) {
      return;
    }
    for (let track of cameraStream.getTracks()) {
      track.stop();
    }
    videoEl.pause();
    videoEl.srcObject = null;
    cameraStream = null;
  }

  async function getDevices() {
    if (devices) {
      return;
    }
    await tick();
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    devices = allDevices.filter(d => !d.label.startsWith("Monitor of"));
  }

  onMount(async () => catchErrors(startCamMic));
  onDestroy(async () => catchErrors(stopCamMic));
</script>

<style>
  .self-video video {
    align-items: center;
    justify-content: center;
  }
  .self-video video {
    width: 100%;
    height: 100%;
    object-fit: contain;
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
