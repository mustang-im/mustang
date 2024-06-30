<hbox class="device-button">
  <RoundButton
    label={video ? (on ? $t`Turn camera off` : $t`Turn camera on`) : (on ? $t`Mute` : $t`Unmute`)}
    classes="toggle"
    onClick={toggle}
    icon={video ? (on ? CameraIcon : CameraOffIcon) : (on ? MicrophoneIcon : MicrophoneOffIcon)}
    iconSize="24px"
    />
  <Menu>
    <RoundButton
      slot="control"
      classes="select-device"
      label={video ? $t`Select camera` : $t`Select microphone`}
      icon={DownIcon}
      iconSize="16px"
      disabled={!on}
      />
    <Menu.Label>{video ? $t`Your cameras` : $t`Your microphones`}</Menu.Label>
    {#if devices}
      {#each availableDevices as device (device.deviceId)}
        <Menu.Item
          on:click={() => catchErrors(() => selectDevice(device))}
          icon={video ? CameraIcon : MicrophoneIcon}
          className={device.deviceId == selectedId ? "selected" : ""}
          >
          {device.label}
        </Menu.Item>
      {/each}
    {/if}
  </Menu>
</hbox>

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import { Menu } from "@svelteuidev/core";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import DownIcon from "lucide-svelte/icons/chevron-down";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let on: boolean; /** in/out */
  export let selectedId: string; /** in/out */
  export let video: boolean; /** video = true, mic = false */
  export let devices: MediaDeviceInfo[]; /** in */

  $: availableDevices = devices?.filter(d => d.kind == (video ? "videoinput" : "audioinput")) ?? [];

  async function toggle() {
    on = !on;
  }

  async function selectDevice(device: MediaDeviceInfo) {
    assert(device?.kind == (video ? "videoinput" : "audioinput"), "Need camera/mic");
    selectedId = device.deviceId;
  }
</script>

<style>
  .device-button :global(button.select-device[role=button]) {
    margin-left: -14px;
    margin-top: 20px;
    padding: 2px;
  }
  .device-button :global(.svelteui-Paper-root) {
    width: 20em;
  }
  /* Other overrides for svelte-ui menu in app.css */
</style>
