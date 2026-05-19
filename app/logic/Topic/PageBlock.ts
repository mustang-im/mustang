import { Paragraph, type PageContent } from "./PageContent";
import type { Topic } from "./Topic";

/** Neutral intermediate representation of a topic page's content.
 * Used to convert between the topic tree and any editor UI without coupling
 * the two. The UI converts to/from its own format; logic applies the blocks
 * to the topic tree. */

export type TextBlock    = { kind: "text";    html: string };
export type EmbedBlock   = { kind: "embed";   contentType: string; contentID: string };
export type HeadingBlock = { kind: "heading"; level: number; text: string; topicID: string | null };
export type PageBlock    = TextBlock | EmbedBlock | HeadingBlock;

/** Returns a flat list of blocks representing `topic`'s content and all
 * descendant topics (as heading blocks).
 * `registerEmbedded` is called for each non-paragraph item; the caller
 * assigns a session-scoped ID and stores the live object in its own registry. */
export function toPageBlocks(
  topic: Topic,
  registerEmbedded: (content: PageContent) => string,
  depth = 1,
): PageBlock[] {
  let blocks: PageBlock[] = [];
  for (let content of topic.content) {
    if (content instanceof Paragraph) {
      if (content.rawHTMLDangerous) {
        blocks.push({ kind: "text", html: content.rawHTMLDangerous });
      }
    } else {
      let id = registerEmbedded(content);
      blocks.push({ kind: "embed", contentType: content.contentType, contentID: id });
    }
  }
  let level = Math.min(depth, 6);
  for (let child of topic.children) {
    blocks.push({ kind: "heading", level, text: child.name, topicID: child.id });
    blocks.push(...toPageBlocks(child, registerEmbedded, depth + 1));
  }
  return blocks;
}

/** Applies a flat list of page blocks back onto the topic tree.
 * Text blocks become Paragraphs, embed blocks restore embedded content via
 * `getEmbedded`, heading blocks find-or-create child Topics (matched by ID,
 * falling back to name), and child topics missing from the blocks are deleted. */
export async function applyPageBlocks(
  topic: Topic,
  blocks: PageBlock[],
  getEmbedded: (id: string) => PageContent | undefined | null,
): Promise<void> {
  let topicsModified = new Set<Topic>();
  let topicStack: Topic[] = [topic];
  topic.content.clear();

  let seenChildTopics = new Set<Topic>();
  let processedParents = new Set<Topic>([topic]);

  for (let block of blocks) {
    let currentTopic = topicStack[topicStack.length - 1];

    if (block.kind === "text") {
      if (block.html.trim() && block.html !== "<p></p>") {
        let para = new Paragraph(currentTopic);
        para.rawHTMLDangerous = block.html;
        topicsModified.add(currentTopic);
      }
    } else if (block.kind === "embed") {
      let content = getEmbedded(block.contentID);
      if (content) {
        content.topic = currentTopic;
        currentTopic.content.add(content);
        topicsModified.add(currentTopic);
      }
    } else if (block.kind === "heading") {
      while (topicStack.length > block.level) topicStack.pop();
      let parent = topicStack[topicStack.length - 1];
      processedParents.add(parent);
      let child = block.topicID
        ? [...parent.children].find(t => t.id === block.topicID)
        : [...parent.children].find(t => t.name === block.text);
      if (child) {
        child.name = block.text;
        child.content.clear();
      } else {
        child = await parent.newChild(block.text);
      }
      seenChildTopics.add(child);
      topicStack.push(child);
      topicsModified.add(child);
    }
  }

  for (let parent of processedParents) {
    for (let child of [...parent.children]) {
      if (!seenChildTopics.has(child)) {
        await child.deleteIt();
      }
    }
  }

  for (let t of topicsModified) {
    await t.save();
  }
}
