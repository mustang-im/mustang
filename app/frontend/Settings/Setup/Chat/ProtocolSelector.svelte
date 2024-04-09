<vbox class="protocol-selector">
  {#each protocols as protocol}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <hbox class="protocol"
      on:click={event => onChange(protocol, event)}
      >
      <input type="radio"
        checked={protocol.protocolID == selectedProtocol}
        value={protocol}
        name="protocol"
        on:change={event => onChange(protocol, event)}
        />
      <label for="protocol" class="name">{protocol.label}</label>
    </hbox>
  {/each}
</vbox>


<script lang="ts" context="module">
  export class ProtocolDescription {
    label: string;
    protocolID: string;
  }
</script>
<script lang="ts">
  /** in */
  export let protocols: ProtocolDescription[];
  /** in/out */
  export let selectedProtocol: string;

  function onChange(newProtocol: ProtocolDescription, event: Event) {
    selectedProtocol = newProtocol.protocolID;
    event.stopPropagation();
  }
</script>

<style>
  .protocol-selector {
    margin-top: 6px;
    align-items: start;
    margin-right: 32px;
    padding-top: 4px;
  }
  .protocol {
    padding: 2px 20px 2px 12px;
    margin: 2px;
  }
  .name {
    margin-left: 8px;
  }
</style>
