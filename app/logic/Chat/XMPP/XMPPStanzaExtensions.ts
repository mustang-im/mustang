/** Registers the message extensions that the `stanza` library doesn't ship with,
 * so that incoming stanzas parse into typed `Message` fields and outgoing ones
 * serialize correctly:
 *  - Reactions (XEP-0444)
 *  - Message Retraction (XEP-0424)
 *  - Replies (XEP-0461)
 *
 * OMEMO (XEP-0384), chat markers, receipts, correction, hints and EME are
 * already built into stanza, so we just use those.
 *
 * Call `registerXMPPExtensions(client)` once, right after creating the client. */
import type { Agent } from "stanza";
import { XMLElement, extendMessage } from "stanza/jxt";
import { NS_OMEMO_AXOLOTL } from "stanza/Namespaces";

export const NS_REACTIONS = "urn:xmpp:reactions:0";
export const NS_RETRACT = "urn:xmpp:message-retract:1";
export const NS_RETRACT_OLD = "urn:xmpp:message-retract:0";
export const NS_REPLY = "urn:xmpp:reply:0";

/** Emoji reactions to another message (XEP-0444) */
export interface Reactions {
  /** ID of the message being reacted to */
  id: string;
  /** The set of emoji; empty means the sender removed their reactions */
  emojis: string[];
}

/** Retraction of a message the sender posted earlier (XEP-0424) */
export interface Retract {
  /** ID of the message being retracted */
  id: string;
}

/** A reply to another message (XEP-0461) */
export interface Reply {
  /** JID of the author of the message being replied to */
  to?: string;
  /** ID of the message being replied to */
  id: string;
}

declare module "stanza/protocol" {
  interface Message {
    reactions?: Reactions;
    retract?: Retract;
    reply?: Reply;
  }
}

export function registerXMPPExtensions(client: Agent): void {
  client.stanzas.define([
    extendMessage({
      reactions: { importer: importReactions, exporter: exportReactions },
      retract: { importer: importRetract, exporter: exportRetract },
      reply: { importer: importReply, exporter: exportReply },
    }),
    // stanza's built-in OMEMO serializes the prekey flag as `prekey="1"`;
    // Conversations and the other clients send the literal `prekey="true"` (and
    // all accept both). Override just that field on the existing <key> element —
    // its rid/value and the header alias from stanza's definition are kept.
    {
      namespace: NS_OMEMO_AXOLOTL,
      element: "key",
      fields: {
        preKey: {
          importer: (xml: XMLElement) => {
            let value = xml.getAttribute("prekey");
            return value == "true" || value == "1" ? true : undefined;
          },
          exporter: (xml: XMLElement, value: boolean) => {
            if (value) {
              xml.setAttribute("prekey", "true");
            }
          },
        },
      },
    },
  ]);
}

function importReactions(message: XMLElement): Reactions | undefined {
  let reactions = message.getChild("reactions", NS_REACTIONS);
  if (!reactions) {
    return undefined;
  }
  return {
    id: reactions.getAttribute("id") ?? "",
    emojis: reactions.getChildren("reaction", NS_REACTIONS).map(reaction => reaction.getText()),
  };
}

function exportReactions(message: XMLElement, data: Reactions): void {
  let reactions = new XMLElement("reactions", { xmlns: NS_REACTIONS, id: data.id });
  for (let emoji of data.emojis) {
    reactions.appendChild(new XMLElement("reaction", {}, [emoji]));
  }
  message.appendChild(reactions);
}

function importRetract(message: XMLElement): Retract | undefined {
  let retract = message.getChild("retract", NS_RETRACT) ?? message.getChild("retract", NS_RETRACT_OLD);
  return retract ? { id: retract.getAttribute("id") ?? "" } : undefined;
}

function exportRetract(message: XMLElement, data: Retract): void {
  message.appendChild(new XMLElement("retract", { xmlns: NS_RETRACT, id: data.id }));
}

function importReply(message: XMLElement): Reply | undefined {
  let reply = message.getChild("reply", NS_REPLY);
  if (!reply) {
    return undefined;
  }
  return {
    to: reply.getAttribute("to"),
    id: reply.getAttribute("id") ?? "",
  };
}

function exportReply(message: XMLElement, data: Reply): void {
  let attributes: Record<string, string> = { xmlns: NS_REPLY, id: data.id };
  if (data.to) {
    attributes.to = data.to;
  }
  message.appendChild(new XMLElement("reply", attributes));
}
