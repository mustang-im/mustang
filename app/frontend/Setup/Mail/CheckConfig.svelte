<StatusMessage status="processing"
  message="Verifying that the configuration works..." />

<hbox class="display">
  <DisplayConfig {config} />
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import DisplayConfig from "./DisplayConfig.svelte";
  import StatusMessage from "./StatusMessage.svelte";
  import { sleep } from "../../../logic/util/util";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in */
  export let config: MailAccount;

  onMount(async () => {
    await sleep(3);
    dispatchEvent("continue");
    // dispatchEvent("fail");
  });
</script>

<style>
  .display {
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
</style>
