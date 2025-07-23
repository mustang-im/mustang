<vbox class="visual-app">
  <div bind:this={networkE} class="network" />
</vbox>

<script lang="ts">
  import { networkForNodes, NodeEx } from "./Vis";
  import { AdditionCollection } from "svelte-collections";
  import { onMount } from "svelte";
  import { Network } from "vis-network";
  import { showError } from "../Util/error";

  export let start: NodeEx;

  let nodes = new AdditionCollection<NodeEx>();
  nodes.add(start);
  start.expand()
    .then(n => nodes.addColl(n))
    .catch(showError);

  let network: Network;
  let data = networkForNodes(nodes);
  let networkE: HTMLDivElement;
  onMount(() => {
    let options = {
      nodes: {
        shape: "circle",
      },
    };
    network = new Network(networkE, data, options);
  });

  $: console.log("nodes", $nodes.contents, "data nodes", data.nodes.length, "data edges", data.edges.length);
</script>

<style>
  .network {
    width: calc(100vw - 64px);
    height: calc(100vh - 40px);
  }
</style>
