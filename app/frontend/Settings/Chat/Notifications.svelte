<HeaderGroupBox>
  <hbox slot="header">
    {$t`Notifications`}
  </hbox>
  <NotificationKinds />
</HeaderGroupBox>

<script lang="ts">
  import NotificationKinds from "../Mail/NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "svelte-i18n-lingui";
</script>

<style>
</style>
