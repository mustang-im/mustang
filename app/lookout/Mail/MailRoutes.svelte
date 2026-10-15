<Route path="compose">
  <MailComposer mail={params?.mail ?? $selectedFolder?.newEMail() ?? ($selectedAccount ?? appGlobal.emailAccounts.first).newEMailFrom()} />
</Route>
<Route path="/">
  <MailPage />
</Route>

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { selectedAccount, selectedFolder } from "../../frontend/Mail/Selected";
  import { getParams } from "../../frontend/AppsBar/selectedApp";
  import MailComposer from "./Composer/MailComposer.svelte";
  import MailPage from "./MailPage.svelte";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location?.state);
</script>
