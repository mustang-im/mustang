<StatusMessage status="success"
  message={$t`Your email account ${config.emailAddress} is working and ready to be used.`}>
  <CheckIcon slot="icon"/>
</StatusMessage>

<hbox class="header">{$t`Account name`}</hbox>
<hbox class="subtitle">{$t`How do you want to call the account?`} - {config.emailAddress}</hbox>
<input type="text" bind:value={config.name} autofocus />

<hbox class="header">{$t`Select the workspace`}</hbox>
<WorkspaceSelector {config} horizontal={true} />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import { t } from "../../../l10n/l10n";

  export let config: MailAccount;
</script>

<style>
  .header {
    font-size: 20px;
    font-weight: bold;
    margin-block-start: 48px;
    margin-block-end: 8px;
  }
  .subtitle {
    font-size: 12px;
    margin-block-start: -8px;
    margin-block-end: 24px;
  }
  input {
    font-size: 20px !important;
  }
</style>
