<StatusMessage status="success"
  message={$t`${config.emailAddress} is working and ready`}>
  <CheckIcon slot="icon"/>
</StatusMessage>

<hbox class="name">
  <input type="text" bind:value={config.name} autofocus />
  {#if typeof(config.icon) == "string" && config.icon.startsWith("data:")}
    <img src={config.icon} width="24px" height="24px" alt="" />
  {/if}
</hbox>
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
  .name {
    align-items: end;
  }
  .name img {
    margin-inline-start: 8px;
    border-radius: 3px;
  }
  .workspace .expander,
  .subtitle {
    font-size: 13px;
    font-weight: 300;
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
    margin-block-end: 4px;
  }
</style>
