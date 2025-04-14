<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <AppButton app={calendarMustangApp} page="/calendar/" />

    <!-- left middle -->
    <AppButton app={contactsMustangApp} page="/contacts/" />

    <AppMenuButton onClick={onClose} />

    <!-- right middle -->
    <AppButton app={mailMustangApp} page="/mail/" />

    <!-- right -->
    <AppButton app={chatMustangApp} page="/chat/" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { calendarMustangApp } from "../../Calendar/CalendarMustangApp";
  import { contactsMustangApp } from "../../Contacts/ContactsMustangApp";
  import { mailMustangApp } from "../../Mail/MailMustangApp";
  import { chatMustangApp } from "../../Chat/ChatMustangApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import AppButton from "./AppButton.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import { navigate } from "svelte-navigator";

  function onClose() {
    navigate(-1);
  }
</script>
