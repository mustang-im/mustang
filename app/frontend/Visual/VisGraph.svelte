<vbox class="vis-graph" bind:clientHeight={height} bind:clientWidth={width} flex>
  <div bind:this={networkE} class="network" style="width: {width}px; height: {height}px; " />
</vbox>

<script lang="ts">
  import { networkForNodes, NodeEx, type SvelteComponentInstance } from "./VisNode";
  import { AdditionCollection } from "svelte-collections";
  import { onMount } from "svelte";
  import { Network } from "vis-network";
  import { showError } from "../Util/error";
  import { createEventDispatcher } from "svelte";
  import { visPersons } from "./Node/VisPerson";
  import { visEMailFolder, visEMailFolders } from "./Node/VisEMail";
  const dispatchEvent = createEventDispatcher<{ openSide: SvelteComponentInstance }>();

  export let start: NodeEx;

  let nodes = new AdditionCollection<NodeEx>();

  async function addStartNode() {
    visPersons.clear();
    visEMailFolders.clear(); // HACK TODO Store on nodes/graph somehow
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
    dispatchEvent("openSide", node.openSide());

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
  let width: number;
  let height: number;
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

  // $: console.log("nodes", $nodes.contents, "data nodes", data.nodes.length, "data edges", data.edges.length);
</script>

<style>
  .vis-graph {
    width:99%;
  }
</style>
