<vbox class="icon-box {type}"
  class:repeat={repeatType}
  style="--color: {color}; --fg-color: {fgcolor}"
  title={tooltip}
  flex>
  {#if repeatType}
    <hbox class="repeat-dot" />
  {:else}
    <hbox class="icon">
      <slot name="icon" />
    </hbox>
  {/if}
  <vbox class="inout" flex>
    {#if outgoing === true}
      <hbox class="outgoing">
        <OutgoingIcon size="12px" />
      </hbox>
    {/if}
    {#if outgoing === false}
      <hbox class="incoming">
        <IncomingIcon size="12px" />
      </hbox>
    {/if}
  </vbox>
  <vbox class="line-box" flex>
    <vbox class="line" flex />
  </vbox>
</vbox>

<script lang="ts">
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import IncomingIcon from "lucide-svelte/icons/arrow-big-right";

  export let type: "email" | "chat" | "file" | "event" | "call";
  /** Whether the previous entry also had the same type */
  export let repeatType: boolean = false;
  export let outgoing: boolean | null;
  export let tooltip: string | null = null;
  export let color: string;
  export let fgcolor: string;
</script>

<style>
  .icon-box {
    align-items: center;
    padding-block-start: 4px;
    position: relative;
  }
  .icon {
    align-items: center;
    justify-content: center;
    height: 24px;
    width: 24px;
    padding: 7px;
    border-radius: 32px;
    background-color: var(--color) !important;
    color: var(--fg-color) !important;
  }
  .repeat-dot {
    height: 12px;
    width: 12px;
    border-radius: 12px;
    margin: 4px;
    background-color: var(--color) !important;
  }
  .inout {
    max-height: 0px;
  }
  .inout > * {
    position: absolute;
    top: 40px;
  }
  .repeat .inout > * {
    top: 8px;
  }
  .outgoing {
    left: 0px;
  }
  .incoming {
    right: 0px;
  }
  .line {
    border-right: 2px solid var(--border);
    margin-top: 6px;
    border-color: var(--color);
  }

  .icon :global(.dummy) {
    background-color: #2ab116;
    background-color: #2ecccd;
    background-color: #0080fd;
    background-color: #f4c81d;
    background-color: #ff4747;
  }
</style>
