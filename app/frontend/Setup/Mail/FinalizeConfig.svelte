<StatusMessage status="success"
  message={$t`Your email account ${config.emailAddress} is working and ready to be used.`}>
  <CheckIcon slot="icon"/>
</StatusMessage>

<input type="text" bind:value={config.name} autofocus />
<hbox class="subtitle">{$t`How do you want to call the account ${config.emailAddress}?`}</hbox>

<vbox class="workspace">
  <ExpandSection>
    <hbox class="expander" slot="header">{$t`Workspace`}</hbox>
    <WorkspaceSelector {config} horizontal={true} />
  </ExpandSection>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ExpandSection from "../../Shared/ExpandSection.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import { t } from "../../../l10n/l10n";

  export let config: MailAccount;
</script>

<style>
  .subtitle {
    font-size: 12px;
  }
  input {
    font-size: 20px !important;
    margin-block-start: 32px;
    padding-inline-start: 0px;
    margin-inline-start: -1px;
  }
  .workspace {
    margin-block-start: 8px;
  }
  .workspace .expander {
    font-size: 12px;
    margin-block-end: 4px;
  }
</style>
