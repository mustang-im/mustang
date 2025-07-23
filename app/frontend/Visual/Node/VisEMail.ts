import { NodeEx, ListNodeEx, type SvelteComponentInstance } from "../VisNode";
import type { EMail } from "../../../logic/Mail/EMail";
import type { Folder } from "../../../logic/Mail/Folder";
import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
import VerticalMessageList from "../../Mail/Vertical/VerticalMessageList.svelte";
import MessageDisplay from "../../Mail/Message/MessageDisplay.svelte";
import { getDateString } from "../../Util/date";
import { showError } from "../../Util/error";
import { gt } from "../../../l10n/l10n";
import { type Collection, MapColl, ArrayColl } from "svelte-collections";

/** Node for single email */
export class VisEMail extends NodeEx {
  email: EMail;

  constructor(email: EMail, fromNode?: NodeEx) {
    super({
      label: email.baseSubject.substring(0, 20) + "\n" +
        email.contact.name + "\n" +
        getDateString(email.received),
      shape: email.outgoing ? "triangle" : "triangleDown",
      color: "blue",
    }, fromNode);
    this.email = email;
  }

  openSide(): SvelteComponentInstance | null {
    return {
      component: MessageDisplay,
      properties: {
        message: this.email,
      },
    };
  };
}

/** Node that expands to a list of 10 emails,
 * with arbitrary search criteria */
export class VisEMailSearch extends ListNodeEx {
  search: SearchEMail;

  constructor(search: SearchEMail, fromNode: NodeEx) {
    super({
      label: gt`EMails`,
      shape: "box",
      color: "blue",
    }, fromNode);
    this.search = search;
  }

  async expand(): Promise<Collection<NodeEx>> {
    let nodes = await super.expand();
    let emails = await this.search.startSearch(10);
    for (let email of emails) {
      nodes.add(new VisEMail(email, this));
    }
    return nodes;
  };

  openSide(): SvelteComponentInstance | null {
    let emails = new ArrayColl<EMail>();
    this.search.startSearch(300)
      .then(es => emails.addAll(es))
      .catch(showError);
    return {
      component: VerticalMessageList,
      properties: {
        messages: emails,
      },
    };
  };
}

/** Node that expends to a list of 10 emails,
 * from a given mail account folder, e.g. inbox */
export class VisEMailFolder extends ListNodeEx {
  folder: Folder;

  constructor(folder: Folder, fromNode: NodeEx) {
    super({
      label: folder.name,
      shape: "box",
      color: "blue",
    }, fromNode);
    this.folder = folder;
  }

  async expand(): Promise<Collection<NodeEx>> {
    let nodes = await super.expand();

    for (let subfolder of this.folder.subFolders) {
      nodes.add(new VisEMailFolder(subfolder, this));
    }

    let emails = this.folder.messages.getIndexRange(0, 10);
    for (let email of emails) {
      nodes.add(new VisEMail(email, this));
    }
    return nodes;
  };

  openSide(): SvelteComponentInstance | null {
    return {
      component: VerticalMessageList,
      properties: {
        messages: this.folder.messages,
      },
    };
  };
}

export function visEMailFolder(folder: Folder, fromNode?: NodeEx): VisEMailFolder {
  let existing = visEMailFolders.get(folder);
  if (existing) {
    fromNode?.edgeTo(existing);
    return existing;
  }
  let vis = new VisEMailFolder(folder, fromNode);
  visEMailFolders.set(folder, vis);
  return vis;
}

export const visEMailFolders = new MapColl<Folder, VisEMailFolder>();
