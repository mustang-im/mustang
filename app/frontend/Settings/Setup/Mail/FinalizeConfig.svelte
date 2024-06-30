<StatusMessage status="success"
  message={$t`Your email account is working and ready to be used.`}>
  <CheckIcon slot="icon"/>
</StatusMessage>

<hbox class="header">{$t`Select the workspace for ${config.emailAddress}`}</hbox>
<WorkspaceSelector {config} />

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import { t } from "../../../../l10n/l10n";

  export let config: MailAccount;
</script>

<style>
  .header {
    font-size: 20px;
    font-weight: bold;
    margin-block-start: 24px;
    margin-block-end: 8px;
  }
</style>
