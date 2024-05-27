<HeaderGroupBox>
  <hbox slot="header">
    Notifications
  </hbox>
  <hbox class="subtitle">When a new mail arrives, show:</hbox>
  <NotificationKinds bind:list={notificationsSetting.value} />
</HeaderGroupBox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import NotificationKinds from "./NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";

  let notificationsSetting = getLocalStorage("notifications.mail", ["popup","sound"]);
</script>

<style>
  .subtitle {
    margin-bottom: 16px;
  }
</style>
