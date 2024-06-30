<HeaderGroupBox>
  <hbox slot="header">
    {$t`Notifications`}
  </hbox>
  <NotificationKinds />
</HeaderGroupBox>

<script lang="ts">
  import NotificationKinds from "../Mail/NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "../../../l10n/l10n";
</script>

<style>
</style>
