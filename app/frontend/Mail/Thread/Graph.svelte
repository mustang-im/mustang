<svg
  width={svgWidth}
  height={svgHeight}
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    {#each positions as p, i}
      {#if p.node.icon}
        <clipPath id="clip-{i}">
          <circle cx={p.x} cy={p.y} r={kRadius} />
        </clipPath>
      {/if}
    {/each}
  </defs>

  <!-- Edges drawn first, underneath nodes -->
  {#each edges as e}
    <path
      d={e.d}
      fill="none"
      stroke="var(--graph-edge-color, #888)"
      stroke-width={e.strokeWidth}
      stroke-linecap="round"
    />
  {/each}

  <!-- Nodes -->
  {#each positions as p, i}
    {@const isFocus = p.node.isFocus}
    {@const isBold = p.node.isBold && !isFocus}

    <!-- Focus outer ring -->
    {#if isFocus}
      <circle
        cx={p.x}
        cy={p.y}
        r={kRadius + kFocusGapWidth + kFocusRindWidth / 2}
        fill="none"
        stroke="var(--graph-focus-ring-color, #000)"
        stroke-width={kFocusRindWidth}
      />
    {/if}

    <!-- Node background circle -->
    <circle
      cx={p.x}
      cy={p.y}
      r={kRadius}
      fill={p.node.icon ? "none" : "var(--graph-node-bg, #e8e8f0)"}
      stroke={isFocus ? "transparent" : "var(--graph-node-border, #666)"}
      stroke-width={isBold ? kBoldBorderWidth : kNormalBorderWidth}
    />

    <!-- Icon image -->
    <Icon
      icon={p.node.icon}
      letter={p.node.placeholder ? p.node.placeholder[0].toUpperCase() : "?"}
      {isBold}
      x={p.x} y={p.y} {i} />
  {/each}
</svg>

<script lang="ts">
  import type { Node } from "./Node";
  import { computeLayout, kRadius, kColWidth, kRowHeight } from "./GraphLayout";
  import Icon from "./Icon.svelte";

  export let root: Node;

  const kFocusGapWidth = 4;
  const kFocusRindWidth = 2;
  const kBoldBorderWidth = 3;
  const kNormalBorderWidth = 1.5;

  $: ({ positions, edges } = computeLayout(root));

  $: svgWidth = (Math.max(...positions.map(p => p.col), 0) + 1) * kColWidth + kRadius;
  $: svgHeight = (Math.max(...positions.map(p => p.row), 0) + 1) * kRowHeight + kRadius;
</script>
