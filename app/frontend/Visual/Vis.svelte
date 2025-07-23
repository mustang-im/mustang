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

  async function addStartNode() {
    setFixed(start);
    nodes.add(start);
    nodes.addColl(await start.expand());
  }

  function getNodeFromVisEvent(visEvent: any): NodeEx | null {
      let nodeID = visEvent.nodes?.[0];
      if (!nodeID) {
        return null;
      }
      return nodes.find(n => n.id == nodeID);
  }

  async function onNodeSelected(node: NodeEx) {
    console.log("on node selected", node.label);
    setFixed(node);
    if (node.hasExpanded) {
      return;
    }
    let newNodes = await node.expand();
    nodes.addColl(newNodes);
  }

  async function onNodeDeselected(node: NodeEx) {
  }

  let fixed = start;
  function setFixed(node: NodeEx) {
    fixed.fixed = false;
    //node.fixed = true;
    fixed = node;
  }

  let network: Network;
  let data = networkForNodes(nodes);
  let networkE: HTMLDivElement;
  onMount(() => {
    let options = {
      /*physics: {
        enabled: true,
        wind: { x: 1, y: 0 },
      },*/
      nodes: {
        shape: "circle",
      },
    };
    addStartNode()
      .catch(showError);
    network = new Network(networkE, data, options);

    network.on("selectNode", visEvent => {
      console.log("selected", visEvent);
      let node = getNodeFromVisEvent(visEvent);
      if (node) {
        onNodeSelected(node)
          .catch(showError);
      }
    });
    network.on("deselectNode", visEvent => {
      let node = getNodeFromVisEvent(visEvent);
      if (node) {
        onNodeDeselected(node)
          .catch(showError);
      }
    });
  });

  $: console.log("nodes", $nodes.contents, "data nodes", data.nodes.length, "data edges", data.edges.length);
</script>

<style>
  .network {
    width: calc(100vw - 64px);
    height: calc(100vh - 40px);
  }
</style>
