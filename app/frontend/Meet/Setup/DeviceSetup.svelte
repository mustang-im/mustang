<vbox flex class="device-setup">
  <vbox class="self-video" flex>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} />
  </vbox>
  <hbox class="buttons">
    <RoundButton
      label="Mute"
      classes="toggle-mic"
      on:click={() => catchErrors(toggleMic)}
      icon={$micOn ? MicrophoneIcon : MicrophoneOffIcon}
      iconSize="24px"
      />
    <RoundButton
      label="Camera"
      classes="toggle-camera"
      on:click={() => catchErrors(toggleCamera)}
      icon={$cameraOn ? CameraIcon : CameraOffIcon}
      iconSize="24px"
      />
  </hbox>
</vbox>

<script lang="ts">
  import { cameraOn, micOn } from "./devices";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import { catchErrors } from "../../Util/error";
  import { onMount } from "svelte";

  let cameraStream: MediaStream;
  let videoEl: HTMLVideoElement;

  async function toggleCamera() {
    $cameraOn = !$cameraOn;
    await restartCamMic();
  }

  async function toggleMic() {
    $micOn = !$micOn;
    await restartCamMic();
  }

  async function restartCamMic() {
    await stopCamMic();
    await startCamMic();
  }

  async function startCamMic() {
    if (!$cameraOn && !$micOn) {
      return;
    }
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: $cameraOn, audio: $micOn });
    if (!cameraStream || !videoEl) {
      return;
    }
    videoEl.srcObject = cameraStream;
    await videoEl.play();
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
