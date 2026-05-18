import type { Node } from "./Node";

export interface NodeLayout {
  node: Node;
  col: number;
  row: number;
  x: number;
  y: number;
}

export interface Edge {
  /** SVG path `d` attribute */
  d: string;
  strokeWidth: number;
}

export const kRadius = 22;
export const kColWidth = 70;
export const kRowHeight = 60;
const kCornerRadius = 10;
const kNormalWidth = 1.5;
const kBoldWidth = 3;

function subtreeHeight(node: Node): number {
  if (node.children.isEmpty) return 1;
  let total = 0;
  for (const child of node.children) {
    total += subtreeHeight(child);
  }
  return total;
}

function layoutNodes(node: Node, col: number, row: number, results: NodeLayout[]): void {
  results.push({
    node,
    col,
    row,
    x: col * kColWidth + kRadius,
    y: row * kRowHeight + kRadius,
  });

  const children = node.children.contents;
  if (children.length === 0) return;

  let nextRow = row + 1;
  for (let i = 0; i < children.length - 1; i++) {
    layoutNodes(children[i], col + 1, nextRow, results);
    nextRow += subtreeHeight(children[i]);
  }

  // Last child goes directly below parent in the same column
  layoutNodes(children[children.length - 1], col, nextRow, results);
}

function buildEdges(positions: NodeLayout[]): Edge[] {
  const byNode = new Map<Node, NodeLayout>();
  for (const p of positions) {
    byNode.set(p.node, p);
  }

  const edges: Edge[] = [];

  for (const p of positions) {
    const children = p.node.children.contents;
    if (children.length === 0) continue;

    const lastChild = children[children.length - 1];
    const lastLayout = byNode.get(lastChild)!;
    const nonLast = children.slice(0, -1);

    // Vertical spine from bottom of this node down to top of last child
    const spineX = p.x;
    const spineTop = p.y + kRadius;
    const spineBottom = lastLayout.y - kRadius;
    const spineW = lastChild.isBold && !lastChild.isFocus ? kBoldWidth : kNormalWidth;

    if (spineBottom > spineTop) {
      edges.push({
        d: `M ${spineX} ${spineTop} V ${spineBottom}`,
        strokeWidth: spineW,
      });
    }

    // Curved branch for each non-last child
    for (const child of nonLast) {
      const cl = byNode.get(child)!;
      const w = child.isBold && !child.isFocus ? kBoldWidth : kNormalWidth;

      // Elbow: come down the spine to (childY - CORNER_R), curve 90° to the right,
      // then run straight to the child's left edge.
      const jx = spineX;
      const jy = cl.y;
      const endX = cl.x - kRadius;

      const d = `M ${jx} ${jy - kCornerRadius} Q ${jx} ${jy} ${jx + kCornerRadius} ${jy} H ${endX}`;
      edges.push({ d, strokeWidth: w });
    }
  }

  return edges;
}

export function computeLayout(root: Node): { positions: NodeLayout[]; edges: Edge[] } {
  const positions: NodeLayout[] = [];
  layoutNodes(root, 0, 0, positions);
  const edges = buildEdges(positions);
  return { positions, edges };
}
