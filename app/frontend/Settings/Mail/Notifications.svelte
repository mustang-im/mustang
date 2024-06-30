<hbox class="groups">
  <HeaderGroupBox>
    <hbox slot="header">
      {$t`Notifications`}
    </hbox>
    <hbox class="subtitle">{$t`When a new mail arrives, show with:`}</hbox>
    <NotificationKinds bind:list={notificationsSetting.value} />
  </HeaderGroupBox>

  <HeaderGroupBox>
    <hbox slot="header">
      {$t`Notify only for`}
    </hbox>
    <hbox class="subtitle">{$t`Show notifications only for mails:`}</hbox>
    <label>
      <input type="checkbox" bind:checked={onlyABSetting.value}/>
      {$t`From people in my address book`}
    </label>
  </HeaderGroupBox>
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import NotificationKinds from "./NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "../../../l10n/l10n";

  let notificationsSetting = getLocalStorage("notifications.mail", ["popup","sound"]);
  let onlyABSetting = getLocalStorage("notifications.mail.only.addressbook", true);
</script>

<style>
  .groups {
    flex-wrap: wrap;
  }
  .groups :global(> *) {
    margin-right: 32px;
  }
  .groups :global(.group .content) {
    padding-right: 48px;
  }
  .subtitle {
    margin-bottom: 16px;
  }
</style>
