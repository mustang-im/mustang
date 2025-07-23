<Splitter initialRightRatio={0.4}>
  <vbox class="graph" slot="left">
    {#if start}
      <VisGraph {start} on:openSide={ev => onOpenSide(ev.detail)} />
    {/if}
  </vbox>
  <vbox class="details" slot="right">
    {#if detailUI}
      <svelte:component this={detailUI.component} {...detailUI.properties} />
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import Splitter from "../Shared/Splitter.svelte";
  import { NodeEx, type SvelteComponentInstance } from "./VisNode";
  import VisGraph from "./VisGraph.svelte";

  export let start: NodeEx;

  let detailUI: SvelteComponentInstance;

  function onOpenSide(ui: SvelteComponentInstance | null) {
    console.log("on open side received", ui.properties, ui);
    detailUI = ui;
  }
</script>
