<vbox flex class="device-setup">
  <vbox class="self-video" flex>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} />
  </vbox>
  <hbox class="buttons">
    <DeviceButton video={false} {devices}
      bind:on={$micOn} bind:selectedId={$selectedMic} />
    <DeviceButton video={true} {devices}
      bind:on={$cameraOn} bind:selectedId={$selectedCamera} />
  </hbox>
</vbox>

<script lang="ts">
  import { cameraOn, micOn, selectedCamera, selectedMic } from "./selectedDevices";
  import { catchErrors } from "../../Util/error";
  import { onMount, tick } from "svelte";
  import DeviceButton from "./DeviceButton.svelte";

  let cameraStream: MediaStream;
  let videoEl: HTMLVideoElement;
  let devices: MediaDeviceInfo[];

  // $: $cameraOn, $micOn, $selectedCamera, $selectedMic, () => catchErrors(restartCamMic);
  $: restartCamMic($cameraOn, $micOn, $selectedCamera, $selectedMic);

  async function restartCamMic(...dummy: any[]) {
    console.log("restart");
    await stopCamMic();
    await startCamMic();
  }

  async function startCamMic() {
    if (!$cameraOn && !$micOn) {
      return;
    }
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: $cameraOn ? {
        deviceId: $selectedCamera,
      } : undefined,
      audio: $micOn ? {
        deviceId: $selectedMic,
      } : undefined,
    });
    if (!cameraStream || !videoEl) {
      return;
    }
    videoEl.srcObject = cameraStream;
    await videoEl.play();

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
</script>

<style>
  .self-video {
    width: 100%;
    height: 100%;
    aspect-ratio: 16/9;
  }
  .self-video video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .buttons {
    margin-top: -22px;
    justify-content: center;
  }
  .buttons :global(> *) {
    margin-left: 4px;
  }
</style>
