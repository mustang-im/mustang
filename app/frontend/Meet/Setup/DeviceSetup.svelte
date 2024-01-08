<vbox flex class="device-setup">
  <vbox class="self-video" flex>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} />
  </vbox>
  <hbox class="buttons">
    <RoundButton
      label={$micOn ? "Mute" : "Unmute"}
      classes="toggle-mic"
      on:click={() => catchErrors(toggleMic)}
      icon={$micOn ? MicrophoneIcon : MicrophoneOffIcon}
      iconSize="24px"
      />
    <Menu>
      <RoundButton
        slot="control"
        classes="select-mic"
        label="Select microphone"
        icon={DownIcon}
        iconSize="16px"
        disabled={!$micOn}
        />
      <Menu.Label>Your microphones</Menu.Label>
      {#if devices}
        {#each devices.filter(d => d.kind == "audioinput") as device (device.deviceId)}
          <Menu.Item
            on:click={() => catchErrors(() => selectMic(device))}
            icon={MicrophoneIcon}
            className={device.deviceId == $selectedMic ? "selected" : ""}
            >
            {device.label}
          </Menu.Item>
        {/each}
      {/if}
    </Menu>
    <RoundButton
      label={$cameraOn ? "Turn camera off" : "Turn camera on"}
      classes="toggle-camera"
      on:click={() => catchErrors(toggleCamera)}
      icon={$cameraOn ? CameraIcon : CameraOffIcon}
      iconSize="24px"
      />
    <Menu>
      <RoundButton
        slot="control"
        classes="select-camera"
        label="Select camera"
        icon={DownIcon}
        iconSize="16px"
        disabled={!$cameraOn}
        />
      <Menu.Label>Your cameras</Menu.Label>
      {#if devices}
        {#each devices.filter(d => d.kind == "videoinput") as device (device.deviceId)}
          <Menu.Item
            on:click={() => catchErrors(() => selectCamera(device))}
            icon={CameraIcon}
            className={device.deviceId == $selectedCamera ? "selected" : ""}
            >
            {device.label}
          </Menu.Item>
        {/each}
      {/if}
    </Menu>
  </hbox>
</vbox>

<script lang="ts">
  import { cameraOn, micOn, selectedCamera, selectedMic } from "./selectedDevices";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import { Menu } from "@svelteuidev/core";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import DownIcon from "lucide-svelte/icons/chevron-down";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { onMount, tick } from "svelte";

  let cameraStream: MediaStream;
  let videoEl: HTMLVideoElement;
  let devices: MediaDeviceInfo[];

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
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: $cameraOn ? {
        deviceId: $selectedCamera,
      } : null,
      audio: $micOn ? {
        deviceId: $selectedMic,
      } : null,
    });
    if (!cameraStream || !videoEl) {
      return;
    }
    videoEl.srcObject = cameraStream;
    await videoEl.play();

    if (!devices) {
      await getDevices();
    }
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
    await tick();
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    devices = allDevices.filter(d => !d.label.startsWith("Monitor of"));
  }

  async function selectCamera(device: MediaDeviceInfo) {
    assert(device?.kind == "videoinput", "Need camera");
    $selectedCamera = device.deviceId;
  }

  async function selectMic(device: MediaDeviceInfo) {
    assert(device?.kind == "audioinput", "Need microphone");
    $selectedMic = device.deviceId;
    await restartCamMic();
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
  .buttons :global(.select-camera),
  .buttons :global(.select-mic) {
    margin-left: -14px;
    margin-top: 20px;
    padding: 2px;
  }
  .buttons :global(.svelteui-Paper-root) {
    width: 20em;
  }
  /* Other overrides for svelte-ui menu in app.css */
</style>
