<div class="graph-container" bind:clientWidth={paneWidth} bind:clientHeight={paneHeight}>
  {#if paneWidth && paneHeight}
  <svg width={paneWidth} height={paneHeight}>
    <defs>
      <filter id="tg-glow-lg" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComponentTransfer in="blur">
          <feFuncA type="gamma" amplitude="0.5" exponent="0.8" offset="0"/>
        </feComponentTransfer>
      </filter>
      <filter id="tg-glow-md" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feComponentTransfer in="blur">
          <feFuncA type="gamma" amplitude="0.5" exponent="1" offset="0"/>
        </feComponentTransfer>
      </filter>
      <filter id="tg-glow-sm" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.75" result="blur"/>
        <feComponentTransfer in="blur">
          <feFuncA type="gamma" amplitude="0.5" exponent="1.2" offset="0"/>
        </feComponentTransfer>
      </filter>
    </defs>

    {#each lines as line}
      {@const fromPos = $anim[line.fromID]}
      {@const toPos = $anim[line.toID]}
      {#if fromPos && toPos}
        <line x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}
          class="gc-line gc-line-{line.fromLevel}"
          opacity={Math.min(fromPos.opacity, toPos.opacity)} />
      {/if}
    {/each}

    <!-- pass 1: circles only (filters live here, text kept far away) -->
    {#each nodes as node (node.id)}
      {@const pos = $anim[node.id]}
      {#if pos}
        <g class="gc-node gc-{node.level}"
          transform="translate({Math.round(pos.x)},{Math.round(pos.y)})"
          style="cursor: {node.clickable ? 'pointer' : 'default'}; opacity: {pos.opacity}"
          on:click={() => node.clickable && onNodeClick(node)}
        >
          <title>{node.topic.name}</title>
          <circle class="gc-fill" r={pos.r} />
          <circle class="gc-halo" r={pos.r} />
          <circle class="gc-ring" r={pos.r} />
        </g>
      {/if}
    {/each}

    <!-- pass 2: labels only. separate layer, no filtered siblings, stays sharp -->
    {#each nodes as node (node.id)}
      {@const pos = $anim[node.id]}
      {#if pos && node.labelLines.length > 0}
        <g transform="translate({Math.round(pos.x)},{Math.round(pos.y)})"
          class="gc-{node.level}"
          style="pointer-events: none; opacity: {pos.opacity}">
          {#each node.labelLines as ln, i}
            <text
              y={(i - (node.labelLines.length - 1) / 2) * (node.fontSize * 1.25) + node.fontSize * 0.35}
              class="gc-label"
              style="font-size: {node.fontSize}px"
              text-anchor="middle"
            >{ln}</text>
          {/each}
        </g>
      {/if}
    {/each}
  </svg>
  {/if}
</div>

<script lang="ts">
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { Topic } from "../../../logic/Topic/Topic";
  import { rootTopic } from "../../../logic/Topic/TopicAccounts";

  export let selectedTopic: Topic;

  let paneWidth = 0;
  let paneHeight = 0;

  /** Radius of the center (selected) node */
  const centerRadius = 52;
  /** Radius of child nodes (orbit 1) */
  const childRadius = 30;
  /** Radius of grandchild nodes (orbit 2) */
  const grandRadius = 22;
  /** Radius of level-4 dot nodes (orbit 3) */
  const dotRadius = 7;
  /** Radius of the add-child button */
  const addBtnRadius = 13;

  type NodeLevel = "center" | "l2" | "l3" | "l4" | "add";

  /** Per-node animated position, size, and visibility */
  type AnimState = Record<string, { x: number; y: number; r: number; opacity: number }>;

  type NodeDef = {
    id: string;
    topic: Topic;
    level: NodeLevel;
    fontSize: number;
    labelLines: string[];
    clickable: boolean;
    isAddButton?: boolean;
  };
  type LineDef = { fromID: string; toID: string; fromLevel: NodeLevel | "parent" };

  let nodes: NodeDef[] = [];
  let lines: LineDef[] = [];

  /** Positions from the previous layout, so newly-appearing nodes can
   *  animate in from their old location instead of snapping in from (0,0) */
  let prevPositions: AnimState = {};

  // Custom interpolator that animates all nodes simultaneously.
  // Nodes added since the last layout fade in; removed nodes fade out.
  let anim = tweened<AnimState>({}, {
    duration: 500,
    easing: cubicOut,
    interpolate: (prev, next) => (t) => {
      let result: AnimState = {};
      let keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
      for (let key of keys) {
        // Node absent in prev → fade in from its target position (opacity 0 → 1).
        let from = prev[key] ?? { ...(next[key]), opacity: 0 };
        // Node absent in next → fade out toward its last known position (opacity 1 → 0).
        let to   = next[key] ?? { ...(prev[key]), opacity: 0 };
        result[key] = {
          x:       from.x + (to.x - from.x) * t,
          y:       from.y + (to.y - from.y) * t,
          r:       from.r + (to.r - from.r) * t,
          opacity: from.opacity + (to.opacity - from.opacity) * t,
        };
      }
      return result;
    },
  });

  /** Splits a long name into at most 2 lines, truncating with … if needed */
  function wrapText(name: string, maxChars: number): string[] {
    if (name.length <= maxChars) {
      return [name];
    }
    let words = name.split(" ");
    let lines: string[] = [];
    let cur = "";
    for (let word of words) {
      // Try appending the next word to the current line.
      let candidate = cur ? cur + " " + word : word;
      if (candidate.length <= maxChars) {
        cur = candidate;
      } else {
        // Word overflows: commit the current line and start a new one.
        if (cur) {
          lines.push(cur);
        }
        cur = word;
        // Stop after one committed line. the remaining text goes into the final push below.
        if (lines.length === 1) {
          break;
        }
      }
    }
    // Commit the last line, truncating if it is still too long.
    if (cur) {
      lines.push(cur.length > maxChars + 3 ? cur.slice(0, maxChars) + "…" : cur);
    }
    return lines.slice(0, 2);
  }

  /**
   * Returns `count` angles evenly spread around `centerAngle` within `spread` radians.
   * Used to fan out grandchild and dot nodes away from their parent.
   */
  function spreadAngles(centerAngle: number, count: number, spread: number): number[] {
    if (count === 0) {
      return [];
    }
    if (count === 1) {
      return [centerAngle];
    }
    return Array.from({ length: count }, (_, i) =>
      centerAngle - spread / 2 + spread * (i / (count - 1))
    );
  }

  /**
   * Computes the full node/line layout for `topic` centered in a pane of
   * size width × height. Returns nodes, connecting lines, and their positions.
   */
  function buildLayout(topic: Topic, width: number, height: number) {
    if (!topic || !width || !height) {
      return { nodes: [], lines: [], positions: {} as AnimState };
    }

    /** Center point of the pane. all orbit positions are relative to this. */
    let centerX = width / 2;
    let centerY = height / 2;
    /** Reserve one extra slot among the children for the add-child button. */
    let slotCount = topic.children.length + 1;
    /** Minimum orbit radius so adjacent child nodes don't overlap each other. */
    let minOrbit = (childRadius * 2 + 14) * slotCount / (2 * Math.PI);
    /** Clamp orbit: at least enough to clear the center node, at most 28% of the smaller pane edge. */
    let childOrbit = Math.max(centerRadius + childRadius + 20, Math.min(minOrbit, Math.min(width, height) * 0.28));
    let grandOrbit = 90;
    let dotOrbit = 44;

    let nodeList: NodeDef[] = [];
    let lineList: LineDef[] = [];
    let positions: AnimState = {};

    /** Registers a node and its position in the layout. */
    function addNode(id: string, x: number, y: number, r: number, nd: NodeDef) {
      nodeList.push(nd);
      positions[id] = { x, y, r, opacity: 1 };
    }

    /** Center node, i.e. the topic currently being viewed. */
    addNode(topic.id, centerX, centerY, centerRadius, {
      id: topic.id,
      topic,
      level: "center",
      fontSize: 13,
      labelLines: wrapText(topic.name, 10),
      clickable: false,
    });

    // Ancestor chain: root on the far left, direct parent closest to center.
    let ancestors: Topic[] = [];
    let ancestor = topic.parent;
    while (ancestor) {
      ancestors.unshift(ancestor);
      ancestor = ancestor.parent;
    }
    if (ancestors.length > 0) {
      let spacing = childRadius * 2 + 14;
      let i = 0;
      for (let anc of ancestors) {
        let ancX = childRadius + 10 + i * spacing;
        let ancY = childRadius + 10;
        addNode(anc.id, ancX, ancY, childRadius, {
          id: anc.id,
          topic: anc,
          level: "l2",
          fontSize: 10,
          labelLines: wrapText(anc.name, 8),
          clickable: true,
        });
        // Chain each ancestor to the previous one (left → right = root → parent).
        if (i > 0) {
          lineList.push({ fromID: ancestors[i - 1].id, toID: anc.id, fromLevel: "parent" });
        }
        i++;
      }
      // Connect the direct parent (rightmost) to the center node.
      lineList.push({ fromID: topic.id, toID: ancestors.at(-1)!.id, fromLevel: "parent" });
    }

    /** Lays out one child node and all its grandchild / dot descendants. */
    function layoutChildBranch(child: Topic, childX: number, childY: number, childAngle: number) {
      addNode(child.id, childX, childY, childRadius, {
        id: child.id,
        topic: child,
        level: "l2",
        fontSize: 10,
        labelLines: wrapText(child.name, 8),
        clickable: true,
      });
      lineList.push({ fromID: topic.id, toID: child.id, fromLevel: "center" });

      let grandKids = child.children;
      let grandAngles = spreadAngles(childAngle, grandKids.length, Math.min(Math.PI * 0.7, grandKids.length * 0.45));
      let j = 0;
      for (let grand of grandKids) {
        let grandAngle = grandAngles[j];
        let grandX = childX + grandOrbit * Math.cos(grandAngle);
        let grandY = childY + grandOrbit * Math.sin(grandAngle);
        addNode(grand.id, grandX, grandY, grandRadius, {
          id: grand.id,
          topic: grand,
          level: "l3",
          fontSize: 9,
          labelLines: wrapText(grand.name, 7),
          clickable: true,
        });
        lineList.push({ fromID: child.id, toID: grand.id, fromLevel: "l2" });

        let greatKids = grand.children;
        let dotAngles = spreadAngles(grandAngle, greatKids.length, Math.min(Math.PI * 0.6, greatKids.length * 0.5));
        let k = 0;
        for (let great of greatKids) {
          let dotAngle = dotAngles[k];
          let dotX = grandX + dotOrbit * Math.cos(dotAngle);
          let dotY = grandY + dotOrbit * Math.sin(dotAngle);
          addNode(great.id, dotX, dotY, dotRadius, {
            id: great.id,
            topic: great,
            level: "l4",
            fontSize: 0,
            labelLines: [],
            clickable: true,
          });
          lineList.push({ fromID: grand.id, toID: great.id, fromLevel: "l3" });
          k++;
        }
        j++;
      }
    }

    let i = 0;
    for (let child of topic.children) {
      let childAngle = (2 * Math.PI * i / slotCount) - Math.PI / 2;
      let childX = centerX + childOrbit * Math.cos(childAngle);
      let childY = centerY + childOrbit * Math.sin(childAngle);
      layoutChildBranch(child, childX, childY, childAngle);
      i++;
    }

    // Add-child button: last orbit slot, slightly inward so it reads as secondary.
    let addAngle = (2 * Math.PI * topic.children.length / slotCount) - Math.PI / 2;
    let addNodeId = topic.id + "/add";
    let addX = centerX + childOrbit * 0.85 * Math.cos(addAngle);
    let addY = centerY + childOrbit * 0.85 * Math.sin(addAngle);
    addNode(addNodeId, addX, addY, addBtnRadius, {
      id: addNodeId,
      topic,
      level: "add",
      fontSize: 10,
      labelLines: ["+"],
      clickable: true,
      isAddButton: true,
    });

    return { nodes: nodeList, lines: lineList, positions };
  }

  async function onNodeClick(node: NodeDef) {
    if (node.isAddButton) {
      let newTopic = await node.topic.newChild("new");
      selectedTopic = newTopic;
    } else {
      selectedTopic = node.topic === rootTopic ? null : node.topic;
    }
  }

  $: $selectedTopic, paneWidth, paneHeight, rebuildLayout();
  function rebuildLayout() {
    let layout = buildLayout(selectedTopic ?? rootTopic, paneWidth, paneHeight);
    nodes = layout.nodes;
    lines = layout.lines;

    // Seed the animation from previous positions so nodes glide to their new spots.
    // Brand-new nodes (absent from prevPositions) start at their target with opacity 0.
    let fromState: AnimState = {};
    for (let [id, target] of Object.entries(layout.positions)) {
      fromState[id] = prevPositions[id]
        ? { ...prevPositions[id] }
        : { ...target, opacity: 0 };
    }

    // Snap to the from-state instantly, then animate forward to the new layout.
    anim.set(fromState, { duration: 0 });
    anim.set(layout.positions);
    prevPositions = layout.positions;
  }
</script>

<style>
  .graph-container {
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--gc-bg);

    /* light theme (default) */
    --gc-bg:       transparent;
    --gc-fill:     #ffffff;
    --gc-fill-dim: #eefefe;
    --gc-text:     #0d1f3c;
    --gc-line:     var(--button-secondary-line);
    --gc-c0:       var(--selected-bg);
    --gc-c2:       var(--selected-bg);
    --gc-c3:       #6ccccc;
    --gc-c4:       var(--button-secondary-line);
  }

  @media (prefers-color-scheme: dark) {
    .graph-container {
      --gc-bg:       #0a1628;
      --gc-fill:     #0d1f3c;
      --gc-fill-dim: #091628;
      --gc-text:     #ffffff;
      --gc-line:     #1e4a6e;
      --gc-c0:       #4dd9ff;
      --gc-c2:       #3bbfdd;
      --gc-c3:       #2a9bb5;
      --gc-c4:       #1a6d80;
    }
  }

  svg {
    display: block;
  }

  /* connecting lines */
  .graph-container :global(.gc-line) {
    stroke-width: 1px;
  }
  .graph-container :global(.gc-line-parent) {
    stroke: var(--gc-line);
    stroke-dasharray: 4 4;
  }
  .graph-container :global(.gc-line-center) {
    stroke: var(--gc-c0);
    stroke-width: 2px;
  }
  .graph-container :global(.gc-line-l2) {
    stroke: var(--gc-c2);
  }
  .graph-container :global(.gc-line-l3) {
    stroke: var(--gc-c3);
  }

  /* labels: sharp, spaced, no filter inheritance */
  .graph-container :global(.gc-label) {
    fill: var(--gc-text);
    font-family: inherit;
    letter-spacing: 0.06em;
  }

  /* fills: opaque background of each node */
  .graph-container :global(.gc-fill) {
    stroke: none;
  }
  .graph-container :global(.gc-center .gc-fill) {
    fill: var(--gc-fill);
  }
  .graph-container :global(.gc-l2 .gc-fill) {
    fill: var(--gc-fill);
  }
  .graph-container :global(.gc-l3 .gc-fill) {
    fill: var(--gc-fill-dim);
  }
  .graph-container :global(.gc-l4 .gc-fill) {
    fill: var(--gc-fill-dim);
  }

  /* halos. drawn *after* fill, so that glow is visible both inside and outside the ring.
     thick stroke + tight blur = glow that fades border-color → transparent. */
  .graph-container :global(.gc-halo) {
    fill: none;
  }
  .graph-container :global(.gc-center .gc-halo) {
    stroke: var(--gc-c0);
    stroke-width: 9px;
    filter: url(#tg-glow-lg);
  }
  .graph-container :global(.gc-l2 .gc-halo) {
    stroke: var(--gc-c2);
    stroke-width: 6px;
    filter: url(#tg-glow-md);
  }
  .graph-container :global(.gc-l3 .gc-halo) {
    stroke: var(--gc-c3);
    stroke-width: 4px;
    filter: url(#tg-glow-sm);
  }
  .graph-container :global(.gc-l4 .gc-halo) {
    stroke: var(--gc-c4);
    stroke-width: 2.5px;
    filter: url(#tg-glow-sm);
  }

  /* crisp rings: no fill, so inner glow from halo remains visible */
  .graph-container :global(.gc-ring) {
    fill: none;
  }
  .graph-container :global(.gc-center .gc-ring) {
    stroke: var(--gc-c0);
    stroke-width: 2px;
  }
  .graph-container :global(.gc-l2 .gc-ring) {
    stroke: var(--gc-c2);
    stroke-width: 0.5px;
  }
  .graph-container :global(.gc-l3 .gc-ring) {
    stroke: var(--gc-c3);
    stroke-width: 0.3px;
  }
  .graph-container :global(.gc-l4 .gc-ring) {
    stroke: var(--gc-c4);
    stroke-width: 0.25px;
  }

  /* add-child button */
  .graph-container :global(.gc-add .gc-fill) {
    fill: var(--gc-fill-dim);
  }
  .graph-container :global(.gc-add .gc-halo) {
    stroke: none;
  }
  .graph-container :global(.gc-add .gc-ring) {
    stroke: var(--gc-c2);
    stroke-width: 0.75px;
    stroke-dasharray: 3 2;
  }
  .graph-container :global(.gc-add .gc-label) {
    fill: var(--gc-c2);
  }
</style>
