<vbox flex class="app-frame">
  <Route path="mail/*">
    <MailAppRoutes />
  </Route>
  <Route path="chat/*">
    <ChatApp />
  </Route>
  <Route path="contacts/*">
    <ContactsAppRoutes />
  </Route>
  <Route path="calendar/*">
    <CalendarApp />
  </Route>
  <Route path="files/*">
    <FilesAppRoutes />
  </Route>
  <Route path="meet/*">
    <MeetAppRoutes />
  </Route>
  <Route path="/app-menu/">
    <AppMenu />
  </Route>
  <Route path="/">
    <!-- default, on app start-->
    <MailAppRoutes />
  </Route>
</vbox>

<script lang="ts">
  import { Route } from "svelte-navigator";
  import MailAppRoutes from "../Mail/MailAppRoutes.svelte";
  import ChatApp from "../Chat/ChatApp.svelte";
  import ContactsAppRoutes from "../Contacts/ContactsAppRoutes.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import FilesAppRoutes from "../Files/FilesAppRoutes.svelte";
  import MeetAppRoutes from "../Meet/MeetAppRoutes.svelte";
  import AppMenu from "./AppMenuM/AppMenu.svelte";
</script>
