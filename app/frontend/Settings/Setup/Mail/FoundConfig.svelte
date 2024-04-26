<StatusMessage status="success" message={successMessage}>
  <CheckIcon slot="icon" />
</StatusMessage>

{#if !altConfigs || altConfigs.length == 1}
  <hbox class="display single">
    <DisplayConfig {config} />
  </hbox>
{:else}
  <vbox class="configs">
    {#each $uniqueConfigs.each as altConfig}
      <vbox class="alt">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <hbox class="protocol-header" on:click={event => onChange(altConfig, event)}>
          <input type="radio"
            checked={altConfig == config}
            value={altConfig.protocol}
            name="protocol"
            on:change={event => onChange(altConfig, event)}
            />
          <label class="protocol" for={altConfig.protocol}>{altConfig.protocol}</label>
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
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { filterUnique } from "../../../../logic/Mail/AutoConfig/collections";
  import DisplayConfig from "./DisplayConfig.svelte";
  import StatusMessage from "../StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import type { ArrayColl } from "svelte-collections";

  export let config: MailAccount;
  export let altConfigs: ArrayColl<MailAccount>;

  // Show only the most preferred (= first) config of the same protocol
  $: uniqueConfigs = filterUnique(altConfigs, (a, b) => a.protocol == b.protocol);

  function onChange(newConfig: MailAccount, event: Event) {
    config = newConfig;
    event.stopPropagation();
  }

  $: successMessage = !config?.source ? "No config found" :
    config.source == "ispdb" ? "We found the configuration in our database." :
    config.source == "autoconfig-isp" ? "We received the configuration from your email provider." :
    config.source == "guess" ? "We guessed a configuration that might work." :
    config.source == "autodiscover-xml" ? "We received the configuration from Microsoft Exchange." :
    config.source == "autodiscover-json" ? "We received the configuration for Microsoft Exchange" :
    "We found a configuration";
</script>

<style>
  .display.single {
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
  .configs {
    margin-top: 24px;
  }
  .alt .display {
    justify-content: start;
    margin-left: 26px;
    margin-top: 12px;
    margin-bottom: 24px;
  }
  .protocol {
    text-transform: uppercase;
    margin-left: 8px;
  }
</style>
