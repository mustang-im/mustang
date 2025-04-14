<vbox flex class="app-frame">
  <Route path="mail/*">
    <MailAppM />
  </Route>
  <Route path="contacts/*">
    <ContactsAppM />
  </Route>
  <Route path="calendar/*">
    <CalendarAppM />
  </Route>
  <Route path="files/*">
    <FilesAppM />
  </Route>
  <Route path="meet/*">
    <MeetAppM />
  </Route>
  <Route path="/">
    <MailAppM />
  </Route>
</vbox>

<script lang="ts">
  import { Route } from "svelte-navigator";
  import MailAppM from "../Mail/MailAppM.svelte";
  import ContactsAppM from "../Contacts/ContactsAppM.svelte";
  import CalendarAppM from "../Calendar/CalendarAppM.svelte";
  import FilesAppM from "../Files/FilesAppM.svelte";
  import MeetAppM from "../Meet/MeetAppM.svelte";
</script>
