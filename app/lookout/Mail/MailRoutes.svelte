<Route path="compose">
  <MailComposer mail={params?.mail ?? $selectedFolder?.newEMail() ?? ($selectedAccount ?? appGlobal.emailAccounts.first).newEMailFrom()} />
</Route>
<Route path="/*">
  <MailPage />
  <Route path="rules">
    <RulesDialog account={params?.account ?? $selectedAccount ?? appGlobal.emailAccounts.first} onClose={goBack} />
  </Route>
  <Route path="rules/create">
    {#if params?.message}
      <CreateRuleDialog message={params.message} onClose={goBack} />
    {/if}
  </Route>
</Route>

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { selectedAccount, selectedFolder } from "../../frontend/Mail/Selected";
  import { getParams, goBack } from "../../frontend/AppsBar/selectedApp";
  import MailComposer from "./Composer/MailComposer.svelte";
  import RulesDialog from "./Rules/RulesDialog.svelte";
  import CreateRuleDialog from "./Rules/CreateRuleDialog.svelte";
  import MailPage from "./MailPage.svelte";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location?.state);
</script>
