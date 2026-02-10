<vbox flex class="device-setup">
  <ErrorMessageInline {ex} />
  <vbox class="self-video" flex>
    <Video stream={$deviceStream?.cameraMicStream} muted={true} />
  </vbox>
  <hbox class="buttons">
    <slot name="buttons-left" />
    <DeviceButton video={false} {devices}
      on={$micOnSetting.value}
      selectedID={$selectedMicSetting.value}
      stream={$deviceStream?.cameraMicStream}
      on:changeOn={event => micOnSetting.value = event.detail}
      on:changeDevice={event => selectedMicSetting.value = event.detail}
      />
    <DeviceButton video={true} {devices}
      on={$cameraOnSetting.value}
      selectedID={$selectedCameraSetting.value}
      on:changeOn={event => cameraOnSetting.value = event.detail}
      on:changeDevice={event => selectedCameraSetting.value = event.detail}
      />
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
  import { gt } from "../../../l10n/l10n";

  let devices: MediaDeviceInfo[];

  let deviceStream: LocalMediaDeviceStreams;
  async function startCamMic() {
    deviceStream ??= new LocalMediaDeviceStreams();
    try {
      await deviceStream.setCameraMicOn(cameraOnSetting.value, micOnSetting.value, selectedCameraSetting.value, selectedMicSetting.value);
    } catch (ex) {
      showErrorInline(ex);
    }
    await getDevices();
  }

  async function stopCamMic() {
    await deviceStream.setCameraMicOn(false, false);
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

  $: ex = null, catchErrors(() => deviceStream?.setCameraMicOn($cameraOnSetting.value, $micOnSetting.value, $selectedCameraSetting.value, $selectedMicSetting.value), showErrorInline);

  let ex: Error | null = null;
  function showErrorInline(error: Error) {
    if (error?.name == "NotReadableError") {
      let cameras = devices?.filter(d => d.kind == "videoinput")?.length ?? 0;
      ex = new Error(cameras == 1
        ? gt`Your camera is in use. Please stop the other video application.`
        : gt`Your camera is in use. Please stop the other video application, or select another camera.`);
      return;
    }
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
  .buttons {
    margin-block-start: -22px;
    justify-content: center;
    z-index: 1;
  }
  .buttons :global(> *) {
    margin-inline-start: 4px;
  }
</style>
