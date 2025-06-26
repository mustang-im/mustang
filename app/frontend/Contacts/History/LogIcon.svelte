<vbox class="icon {type}">
  <slot name="icon" />
  {#if outgoing === true}
    <hbox class="outgoing">
      <OutgoingIcon size="10px" />
    </hbox>
  {:else if outgoing === false}
    <hbox class="incoming">
      <IncomingIcon size="10px" />
    </hbox>
  {:else}
    <hbox class="unidir" />
  {/if}
</vbox>

<script lang="ts">
  import OutgoingIcon from "lucide-svelte/icons/move-left";
  import IncomingIcon from "lucide-svelte/icons/move-right";

  export let type: "email" | "chat" | "event" | "call";
  export let outgoing: boolean | null;
</script>

<style>
  .icon {
    min-width: 24px;
    max-width: 24px;
    min-height: 32px;
    padding: 8px 12px;
    justify-content: center;
    border-top: 1px solid var(--border);
  }
  .email {
    background-color: #0080fd !important;
  }
  .chat {
    background-color: #2ab116 !important;
  }
  .event {
    background-color: #f4c81d !important;
  }
  .call {
    background-color: #ff4747 !important;
  }
  .icon :global(.dummy) {
    background-color: #2ab116;
    background-color: #2ecccd;
    background-color: #0080fd;
    background-color: #f4c81d;
    background-color: #ff4747;
  }
  .outgoing {
    align-self: start;
  }
  .incoming {
    align-self: end;
  }
</style>
