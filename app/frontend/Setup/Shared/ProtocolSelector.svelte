<vbox class="protocol-selector">
  {#each protocols as protocol}
    <Clickable onClick={event => onChange(protocol, event)}>
      <hbox class="protocol">
        <input type="radio"
          checked={protocol.protocolID == selectedProtocol}
          value={protocol}
          name="protocol"
          on:change={event => onChange(protocol, event)}
          />
        <label for="protocol" class="name">{protocol.label}</label>
      </hbox>
    </Clickable>
  {/each}
</vbox>


<script lang="ts" context="module">
  export class ProtocolDescription {
    label: string;
    protocolID: string;
  }
</script>
<script lang="ts">
  import Clickable from "../../Shared/Clickable.svelte";

  /** in */
  export let protocols: ProtocolDescription[];
  /** in/out */
  export let selectedProtocol: string = protocols[0]?.protocolID;

  function onChange(newProtocol: ProtocolDescription, event: Event) {
    selectedProtocol = newProtocol.protocolID;
    event.stopPropagation();
  }
</script>

<style>
  .protocol-selector {
    margin-block-start: 6px;
    align-items: start;
    margin-inline-end: 32px;
    padding-block-start: 4px;
  }
  .protocol {
    padding: 2px 20px 2px 12px;
    margin: 2px;
  }
  .name {
    margin-inline-start: 8px;
  }
</style>
