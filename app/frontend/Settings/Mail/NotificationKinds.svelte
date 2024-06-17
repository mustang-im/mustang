<vbox class="notifications">
  <label>
    <input type="checkbox" value="popup" bind:group={list} />
    Popup
  </label>
  <img src={popupImg} title="Popup" alt="Popup" />

  <label>
    <input type="checkbox" value="sound" bind:group={list} />
    Sound
  </label>
  <img src={soundImg} title="Sound" alt="Sound" />

  <label title="Not yet implemented">
    <input type="checkbox" value="appbar" bind:group={list} disabled />
    Bubble on the appbar in {appName}
  </label>
  <img src={appbarImg} title="Appbar" alt="Appbar" />

  <label title="Not yet implemented">
    <input type="checkbox" value="taskbar" bind:group={list} disabled />
    Bubble on the system task bar
  </label>
  <img src={taskbarImg} title="System task bar" alt="System task bar" />
</vbox>

<!--
<img src={trayImg} title="System tray icon" alt="System tray icon" />
-->

<script lang="ts">
  import popupImg from "../../asset/settings/notification/popup.png";
  import soundImg from "../../asset/settings/notification/sound.png";
  import appbarImg from "../../asset/settings/notification/appbar.png";
  import taskbarImg from "../../asset/settings/notification/taskbar.png";
  import { appName } from "../../build";
  //import trayImg from "../../asset/settings/notification/tray.png";

  /** in/out */
  export let list: string[];
</script>

<style>
  label {
    align-items: center;
    display: flex;
  }
  label input {
    margin-right: 8px;
  }
  img {
    width: 99px;
    height: 64px;
    margin: 4px 0px 24px 24px;
  }
</style>
