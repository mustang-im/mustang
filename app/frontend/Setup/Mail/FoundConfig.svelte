{#if !haveError}
  <StatusMessage status="success" message={successMessage}>
    <CheckIcon slot="icon" />
  </StatusMessage>
{/if}

{#if !altConfigs || altConfigs.length == 1}
  <hbox class="display single">
    <DisplayConfig {config} />
  </hbox>
{:else}
  <vbox class="configs">
    {#each $uniqueConfigs.each as altConfig}
      <vbox class="alt">
        <hbox class="protocol-header" on:click={event => onChange(altConfig, event)}>
          <input type="radio"
            checked={altConfig == config}
            value={altConfig.protocol}
            name="protocol"
            on:change={event => onChange(altConfig, event)}
            />
          <label class="protocol" for={altConfig.protocol}>{labelForMailProtocol(altConfig.protocol)}</label>
        </hbox>
        {#if altConfig == config}
          <hbox class="display">
            <DisplayConfig config={altConfig} />
          </hbox>
        {/if}
      </vbox>
    {/each}
  </vbox>
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { filterUnique } from "../../../logic/Mail/AutoConfig/collections";
  import DisplayConfig from "./DisplayConfig.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { labelForMailProtocol } from "../../../logic/Mail/AccountsList/MailAccounts";

  export let config: MailAccount;
  export let altConfigs: ArrayColl<MailAccount>;
  export let haveError = false;

  // Show only the most preferred (= first) config of the same protocol
  // TODO POP3 not yet implemented
  $: uniqueConfigs = filterUnique(altConfigs?.filter(a => a.protocol != "pop3"), (a, b) => a.protocol == b.protocol);

  function onChange(newConfig: MailAccount, event: Event) {
    config = newConfig;
    event.stopPropagation();
  }

  $: successMessage = !config?.source ? $t`No config found` :
    config.source == "ispdb" ? $t`We found the configuration in our database.` :
    config.source == "autoconfig-isp" ? $t`We received the configuration from your email provider.` :
    config.source == "guess" ? $t`We guessed a configuration that might work.` :
    config.source == "autodiscover-xml" ? $t`We received the configuration from Microsoft Exchange.` :
    config.source == "autodiscover-json" ? $t`We received the configuration for Microsoft Exchange` :
    $t`We found a configuration`;
</script>

<style>
  .display.single {
    justify-content: center;
    margin-block-start: 24px;
    margin-block-end: 24px;
  }
  .configs {
    margin-block-start: 24px;
  }
  .alt .display {
    justify-content: start;
    margin-inline-start: 26px;
    margin-block-start: 12px;
    margin-block-end: 24px;
  }
  .protocol {
    margin-inline-start: 8px;
  }
</style>
