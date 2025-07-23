import { ArrayColl, type Collection } from "svelte-collections";
import type { Node, NodeOptions, Edge, Color, ArrowHead } from "vis-network";
import { DataSet } from "vis-data";
import { AbstractFunction, assert } from "../../logic/util/util";
import type { ComponentType, SvelteComponentTyped } from "svelte";

export class NodeEx implements Node {
  id: number;
  label: string;
  color?: string | Color;

  edges = new ArrayColl<Edge>();
  hasExpanded = false;
  /** Pinned to center of screen */
  fixed = false;

  constructor(init: NodeOptions, fromNode?: NodeEx) {
    this.id = ++lastID;
    Object.assign(this, init);
    if (fromNode) {
      this.edges.add(new EdgeEx(fromNode, this));
    }
  }

  async expand(): Promise<Collection<NodeEx>> {
    assert(!this.hasExpanded, this.label + " already expanded");
    this.hasExpanded = true;
    return new ArrayColl<NodeEx>();
  };

  openSide(): SvelteComponentInstance | null {
    return null;
  };

  edgeTo(toNode: NodeEx) {
    if (!toNode || toNode == this) {
      return;
    }
    if (this.edges.find(edge =>
          edge.from == this.id && edge.to == toNode.id ||
          edge.to == this.id && edge.from == toNode.id)) {
      // TODO strengthen connection
      return;
    }
    this.edges.add(new EdgeEx(this, toNode));
  }
}

export class ListNodeEx extends NodeEx {
}

export class EdgeEx implements Edge {
  /** ID of this relationship */
  id: number;
  /** ID of origin node */
  from: number;
  /** ID of destination node */
  to: number;
  color: string | Color | undefined | any;

  chosen?: boolean;
  label?: string;
  arrows?: {
    to?: boolean | ArrowHead;
    from?: boolean | ArrowHead;
  };

  constructor(fromNode: NodeEx, toNode: NodeEx) {
    this.id = ++lastID;
    this.from = fromNode.id;
    this.to = toNode.id;
    this.color = toNode.color;
  }
}

let lastID = 0;

/** Creates the `data` for `Network`.
 * Subscribes to `nodes` and adds and removes `Node`s and `Edge`s dynamically from the `DataSet`s,
 * so that they are automatically added and removed from the visualization. */
export function networkForNodes(nodes: Collection<NodeEx>): { nodes: DataSet<Node>, edges: DataSet<Edge> } {
  let nodesDataSet = new DataSet<Node>();
  let edgesDataSet = new DataSet<Edge>();

  for (let node of nodes) {
    nodesDataSet.add(node);
    for (let edge of node.edges) {
      edgesDataSet.add(edge);
    }
  }

  let observer = {
    added(nodes: NodeEx[]) {
      console.log("nodes added", nodes);
      for (let node of nodes) {
        nodesDataSet.add(node);
        for (let edge of node.edges) {
          edgesDataSet.add(edge);
        }
      }
    },
    removed(nodes: NodeEx[]) {
      console.log("nodes removed", nodes);
      for (let node of nodes) {
        nodesDataSet.remove(node);
        for (let edge of node.edges) {
          edgesDataSet.remove(edge);
        }
      }
    },
  };
  nodes.registerObserver(observer);
  return {
    _observer: observer, // keep alive
    nodes: nodesDataSet,
    edges: edgesDataSet,
  };
}

export type SvelteComponentInstance = {
  component: ComponentType<SvelteComponentTyped>;
  /** Parameters that will be passed to `component` as Svelte component properties */
  properties: Record<string, any>;
};
