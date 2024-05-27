<hbox class="groups">
  <HeaderGroupBox>
    <hbox slot="header">
      Notifications
    </hbox>
    <hbox class="subtitle">When a new mail arrives, show with:</hbox>
    <NotificationKinds bind:list={notificationsSetting.value} />
  </HeaderGroupBox>

  <HeaderGroupBox>
    <hbox slot="header">
      Notify only for
    </hbox>
    <hbox class="subtitle">Show notifications only for mails:</hbox>
    <label>
      <input type="checkbox" bind:checked={onlyABSetting.value}/>
      From people in my address book
    </label>
  </HeaderGroupBox>
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import NotificationKinds from "./NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";

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
    margin-right: 32px;
  }
  .subtitle {
    margin-bottom: 16px;
  }
</style>
