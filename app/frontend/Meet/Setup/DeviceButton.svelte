<hbox class="device-button">
  <RoundButton
    label={video ? (on ? $t`Turn camera off` : $t`Turn camera on`) : (on ? $t`Mute` : $t`Unmute`)}
    classes="toggle"
    onClick={onToggleDevice}
    icon={video ? (on ? CameraIcon : CameraOffIcon) : (on ? MicrophoneIcon : MicrophoneOffIcon)}
    iconSize="24px"
    />
  <ButtonMenu bind:isMenuOpen>
    <RoundButton
      slot="control"
      onClick={onMenuToggle}
      classes="select-device"
      label={video ? $t`Select camera` : $t`Select microphone`}
      icon={DownIcon}
      iconSize="16px"
      disabled={!on}
      />
    <MenuLabel label={video ? $t`Your cameras` : $t`Your microphones`} />
    {#if devices}
      {#each availableDevices as device (device.deviceId)}
        <MenuItem
          onClick={() => selectDevice(device)}
          icon={video ? CameraIcon : MicrophoneIcon}
          label={device.label}
          selected={device.deviceId == selectedId}
          />
      {/each}
    {/if}
  </ButtonMenu>
</hbox>

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import DownIcon from "lucide-svelte/icons/chevron-down";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let on: boolean; /** in/out */
  export let selectedId: string; /** in/out */
  export let video: boolean; /** video = true, mic = false */
  export let devices: MediaDeviceInfo[]; /** in */

  $: availableDevices = devices?.filter(d => d.kind == (video ? "videoinput" : "audioinput")) ?? [];

  async function onToggleDevice() {
    on = !on;
  }

  async function selectDevice(device: MediaDeviceInfo) {
    assert(device?.kind == (video ? "videoinput" : "audioinput"), "Need camera/mic");
    selectedId = device.deviceId;
  }

  let isMenuOpen: boolean;
  function onMenuToggle(event: Event) {
    event.stopPropagation();
    isMenuOpen = !isMenuOpen;
  }
</script>

<style>
  .device-button :global(button.select-device) {
    margin-inline-start: -14px;
    margin-block-start: 20px;
    padding: 2px;
  }
  .device-button :global(button.select-device:not(:hover)) {
    background-color: var(--bg);
  }
  .device-button :global(button.select-device.disabled) {
    visibility: hidden;
  }
</style>
