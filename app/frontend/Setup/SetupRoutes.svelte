<Route path="initial">
  <InitialSetup />
</Route>
<Route path="mail">
  <SetupMail />
</Route>
<Route path="chat">
  <SetupChat />
</Route>
<Route path="contacts">
  <SetupContacts />
</Route>
<Route path="calendar">
  <SetupCalendar />
</Route>
<Route path="meet">
  <SetupMeetAccount />
</Route>
<!--
<Route path="file">
  <SetupFilesAccount />
</Route>
-->
<Route path="/">
  <SetupAnyAccountTypeDialog />
</Route>

<script lang="ts">
  import InitialSetup from "./Import/InitialSetup.svelte";
  import SetupAnyAccountTypeDialog from "./SetupAnyAccountTypeDialog.svelte";
  import SetupMail from "./Mail/SetupMail.svelte";
  import SetupChat from "./Chat/SetupChat.svelte";
  import SetupContacts from "./Contacts/SetupContacts.svelte";
  import SetupCalendar from "./Calendar/SetupCalendar.svelte";
  import SetupMeetAccount from "./Meet/SetupMeetAccount.svelte";
  import { Route } from "svelte-navigator";
</script>
