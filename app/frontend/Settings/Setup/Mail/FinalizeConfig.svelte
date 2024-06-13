<StatusMessage status="success"
  message="Your email account is working and ready to be used.">
  <CheckIcon slot="icon"/>
</StatusMessage>

<hbox class="header">Select the workspace for {config.emailAddress}</hbox>
<WorkspaceSelector {config} />

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";

  export let config: MailAccount;
</script>

<style>
  .header {
    font-size: 20px;
    font-weight: bold;
    margin-top: 24px;
    margin-bottom: 8px;
  }
</style>
