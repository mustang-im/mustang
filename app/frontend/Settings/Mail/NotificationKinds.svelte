<vbox class="notifications">
  <Checkbox label="Popup" bind:checked={isPopup} size="xs" />
  <img src={popupImg} title="Popup" alt="Popup" />

  <Checkbox label="Sound" bind:checked={isSound} size="xs" />
  <img src={soundImg} title="Sound" alt="Sound" />

  <Checkbox label="Bubble on the appbar in Mustang" bind:checked={isAppbar} size="xs" disabled title="Not yet implemented" />
  <img src={appbarImg} title="Appbar" alt="Appbar" />

  <Checkbox label="Bubble on the system task bar" bind:checked={isTaskbar} size="xs" disabled title="Not yet implemented" />
  <img src={taskbarImg} title="System task bar" alt="System task bar" />
</vbox>

<!--
<Checkbox label="Show an icon on the system tray" bind:checked={isTray} size="xs" />
<img src={trayImg} title="System tray icon" alt="System tray icon" />
-->

<script lang="ts">
  import { Checkbox } from "@svelteuidev/core";
  import popupImg from "../../asset/settings/notification/popup.png";
  import soundImg from "../../asset/settings/notification/sound.png";
  import appbarImg from "../../asset/settings/notification/appbar.png";
  import taskbarImg from "../../asset/settings/notification/taskbar.png";
  //import trayImg from "../../asset/settings/notification/tray.png";

  let isPopup = true;
  let isSound = true;
  let isAppbar = false;
  let isTaskbar = false;
  let isTray = false;
</script>

<style>
  .notifications :global(.svelteui-Checkbox-label) {
    font-size: 16px;
  }

  img {
    width: 99px;
    height: 64px;
    margin: 4px 0px 24px 24px;
  }
</style>
