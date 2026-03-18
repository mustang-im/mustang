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
<div class="subtitle font-small">
  <span class="label">{$t`Account name`}</span>
  <span>{$t`How do you want to call the account ${config.emailAddress}?`}</span>
</div>

{#if appGlobal.emailAccounts.isEmpty}
  <hbox class="realname">
    <input type="text" bind:value={config.realname} autofocus />
  </hbox>
  <hbox class="subtitle font-small">
    <span class="label">{$t`Your name`}</span>
    <span>{$t`How your name will be seen by others`}</span>
  </hbox>
{/if}

<vbox class="workspace font-small">
  <ExpandSection>
    <hbox class="expander font-small" slot="header">{$t`Workspace`}</hbox>
    <WorkspaceSelector bind:selectedWorkspace={config.workspace} horizontal={true} />
  </ExpandSection>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { appGlobal } from "../../../logic/app";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ExpandSection from "../../Shared/ExpandSection.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import { t } from "../../../l10n/l10n";

  export let config: MailAccount;

  config.workspace ??= appGlobal.workspaces.last;
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
    font-weight: 300;
  }
  .subtitle .label {
    font-weight: 400;
    margin-inline-end: 0.5em;
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
    font-weight: 400;
  }
</style>
