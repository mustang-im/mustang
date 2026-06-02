<vbox class="protocol-selector">
  {#each protocols as protocol}
    <label class="protocol">
      <input type="radio" bind:group={selectedDescr} value={protocol} name="protocol" />
      <span class="name">{protocol.label}</span>
    </label>
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
  export let selectedProtocol: string = protocols[0]?.protocolID;

  let selectedDescr: ProtocolDescription = protocols.find(p => p.protocolID == selectedProtocol) ?? protocols[0];
  $: selectedProtocol = selectedDescr?.protocolID;
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
