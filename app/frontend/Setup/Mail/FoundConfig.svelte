<StatusMessage status="success"
  message="We found the configuration in our database.">
  <CheckIcon slot="icon" />
</StatusMessage>

{#if altConfigs.length == 1}
  <hbox class="display">
    <DisplayConfig {config} />
  </hbox>
{:else}
  {#each $altConfigs.each as altConfig}
    <hbox>
      <input type="radio"
        checked={altConfig == config}
        value={altConfig.protocol}
        name="protocol"
        on:change={() => onChange(altConfig)}
        />
      <hbox class="protocol">{altConfig.protocol}</hbox>
    </hbox>
    {#if altConfig == config}
      <hbox class="display">
        <DisplayConfig config={altConfig} />
      </hbox>
    {/if}
  {/each}
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import DisplayConfig from "./DisplayConfig.svelte";
  import StatusMessage from "./StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import type { ArrayColl } from "svelte-collections";

  export let config: MailAccount;
  export let altConfigs: ArrayColl<MailAccount>;

  function onChange(newConfig: MailAccount) {
    config = newConfig;
  }
</script>

<style>
  .display {
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
  .protocol {
    text-transform: uppercase;
    margin-left: 8px;
  }
</style>
