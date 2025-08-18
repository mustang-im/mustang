<vbox flex class="app-frame">
  <Route path="mail/*">
    <MailAppM />
  </Route>
  <Route path="chat/*">
    <ChatAppM />
  </Route>
  <Route path="contacts/*">
    <ContactsAppRoutes />
  </Route>
  <Route path="calendar/*">
    <CalendarApp />
  </Route>
  <Route path="files/*">
    <FilesAppM />
  </Route>
  <Route path="meet/*">
    <MeetAppM />
  </Route>
  <Route path="/app-menu/">
    <AppMenuM />
  </Route>
  <Route path="/">
    <MailAppM />
  </Route>
</vbox>

<script lang="ts">
  import { Route } from "svelte-navigator";
  import MailAppM from "../Mail/MailAppM.svelte";
  import ChatAppM from "../Chat/ChatAppM.svelte";
  import ContactsAppRoutes from "../Contacts/ContactsAppRoutes.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import FilesAppM from "../Files/FilesAppM.svelte";
  import MeetAppM from "../Meet/MeetAppM.svelte";
  import AppMenuM from "./AppMenuM/AppMenu.svelte";
</script>
