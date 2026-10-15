{#if message}
  <hbox class="print-host">
    <MessagePrint {message} bind:this={printE} />
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MessageActions } from "../MessageActions";
  import MessagePrint from "../../../frontend/Mail/Message/MessagePrint.svelte";
  import { onDestroy, onMount, tick } from "svelte";

  let message: EMail | null = null;
  let printE: MessagePrint;

  async function print(toPrint: EMail) {
    message = toPrint;
    await tick();
    await toPrint.loadBody();
    await printE.print();
  }

  onMount(() => {
    MessageActions.printer = { print };
  });
  onDestroy(() => {
    if (MessageActions.printer?.print == print) {
      MessageActions.printer = null;
    }
  });
</script>

<style>
  .print-host {
    position: fixed;
    left: -10000px;
    top: 0;
    width: 800px;
    height: 600px;
  }
</style>
