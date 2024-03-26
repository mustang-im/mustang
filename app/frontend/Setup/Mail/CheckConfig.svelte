<StatusMessage status="processing"
  message="Verifying that the configuration works..." />

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
</style>
