<HeaderGroupBox>
  <hbox slot="header">
    {$t`Notifications`}
  </hbox>
  <NotificationKinds bind:list={$notificationsSetting.value} />
</HeaderGroupBox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import NotificationKinds from "../Mail/NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "../../../l10n/l10n";

  let notificationsSetting = getLocalStorage("notifications.chat", ["popup"]);
</script>

<style>
</style>
