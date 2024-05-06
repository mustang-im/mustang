import { Folder, SpecialFolder } from "../Folder";
import { EWSEMail } from "./EWSEMail";
import type { EWSAccount } from "./EWSAccount";
import { SQLFolder } from "../SQL/SQLFolder";
import { SQLEMail } from "../SQL/SQLEMail";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";

export class EWSFolder extends Folder {
  account: EWSAccount;

  newEMail(): EWSEMail {
    return new EWSEMail(this);
  }

  fromXML(xmljs: any) {
    this.id = xmljs.FolderId.Id;
    this.name = xmljs.DisplayName;
    this.countTotal = Number(xmljs.TotalCount);
    this.countUnread = Number(xmljs.UnreadCount);
    switch (xmljs.DistinguishedFolderId) {
    case "inbox":
      this.specialFolder = SpecialFolder.Inbox;
      break;
    case "drafts":
      this.specialFolder = SpecialFolder.Drafts;
      break;
    case "sentitems":
      this.specialFolder = SpecialFolder.Sent;
      break;
    case "junkemail":
      this.specialFolder = SpecialFolder.Spam;
      break;
    case "deleteditems":
      this.specialFolder = SpecialFolder.Trash;
      break;
    //case "outbox":
    }
  }

  async listMessages() {
    if (!this.dbID) {
      await SQLFolder.save(this);
    }
    await SQLEMail.readAll(this);

    let allEmail: ArrayColl<EWSEMail> = new ArrayColl();
    let request = {
      m$FindItem: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "message:IsRead",
            }, {
              FieldURI: "item:IsDraft",
            }, {
              FieldURI: "item:Flag",
            }],
            t$ExtendedFieldURI: {
              PropertyTag: "0x1080",
              PropertyType: "Integer",
            },
          },
        },
        m$IndexedPageItemView: {
          BasePoint: "Beginning",
          Offset: 0,
        },
        m$ParentFolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
        Traversal: "Shallow",
      },
    };
    let result: any = { RootFolder: {} };
    while (result.RootFolder.IncludesLastItemInRange != "true") {
      result = await this.account.callEWS(request);
      if (!result.RootFolder.Items) {
        // This folder is empty.
        break;
      }
      request.m$FindItem.m$IndexedPageItemView.Offset = result.RootFolder.IndexedPagingOffset;
      let messages = result.RootFolder.Items.Message;
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
      let newMessageIDs = [];
      for (let message of messages) {
        let email = this.getEmailByItemId(message.ItemId.Id);
        if (email) {
          email.setFlags(message);
          await SQLEMail.saveWritableProps(email);
          allEmail.add(email);
        } else {
          newMessageIDs.push(message.ItemId);
        }
      }
      if (newMessageIDs.length) {
        let request = {
          m$GetItem: {
            m$ItemShape: {
              t$BaseShape: "IdOnly",
              t$AdditionalProperties: {
                t$FieldURI: [{
                  FieldURI: "message:InternetMessageId",
                }, {
                  FieldURI: "message:IsRead",
                }, {
                  FieldURI: "message:References",
                }, {
                  FieldURI: "message:ReplyTo",
                }, {
                  FieldURI: "message:From",
                }, {
                  FieldURI: "message:Sender",
                }, {
                  FieldURI: "message:ToRecipients",
                }, {
                  FieldURI: "message:CcRecipients",
                }, {
                  FieldURI: "message:BccRecipients",
                /* Non-MIME
                }, {
                  FieldURI: "item:Attachments",
                */
                }, {
                  FieldURI: "item:Subject",
                }, {
                  FieldURI: "item:DateTimeReceived",
                }, {
                  FieldURI: "item:InReplyTo",
                }, {
                  FieldURI: "item:IsDraft",
                }, {
                  FieldURI: "item:DateTimeSent",
                /* Non-MIME
                }, {
                  FieldURI: "item:Body",
                */
                }, {
                  FieldURI: "item:Flag",
                /* Non-MIME
                }, {
                  FieldURI: "item:TextBody",
                */
                }],
                t$ExtendedFieldURI: {
                  PropertyTag: "0x1080",
                  PropertyType: "Integer",
                },
              },
            },
            m$ItemIds: {
              t$ItemId: newMessageIDs,
            },
          },
        };
        let results = await this.account.callEWS(request);
        if (!Array.isArray(results)) {
          results = [results];
        }
        for (let result of results) {
          let email = this.newEMail();
          email.fromXML(result.Items.Message);
          await SQLEMail.save(email);
          allEmail.add(email);
        }
      }
    }

    for (let email of this.messages.subtract(allEmail).contents) {
      SQLEMail.deleteIt(email);
    }
    this.messages.replaceAll(allEmail);
  }

  async downloadMessages(): Promise<Collection<EWSEMail>> {
    let downloadedEmail = new ArrayColl<EWSEMail>();
    let emailToDownload = this.messages.contents.filter(message => !message.downloadComplete) as EWSEMail[];
    const kMaxCount = 50;
    for (let i = 0; i < emailToDownload.length; i += kMaxCount) {
      let batch = emailToDownload.slice(i, i + 50);
      let request = {
        m$GetItem: {
          m$ItemShape: {
            t$BaseShape: "IdOnly",
            t$IncludeMimeContent: true,
          },
          m$ItemIds: {
            t$ItemId: batch.map(message => ({ Id: message.itemID })),
          },
        },
      };
      let results = await this.account.callEWS(request);
      if (!Array.isArray(results)) {
        results = [results];
      }
      for (let result of results) {
        let email = emailToDownload.find(email => email.itemID == result.Items.Message.ItemId.Id);
        if (email && !email.downloadComplete) {
          email.mime = new Uint8Array(await (await fetch("data:message/rfc822;base64," + result.Items.Message.MimeContent.Value)).arrayBuffer());
          await email.parseMIME();
          await email.save();
          downloadedEmail.add(email);
        }
      }
    }

    for (let email of this.messages) {
      if (!email.threadID && email.dbID) {
        await email.findThread(this.messages);
      }
    }

    return downloadedEmail;
  }

  getEmailByItemId(id: string): EWSEMail {
    return this.messages.find((m: EWSEMail) => m.itemID == id) as EWSEMail;
  }

  async moveMessagesHere(messages: Collection<EWSEMail>) {
    assert(messages.contents.every(message => message.folder.account == this.account), "Cannot move messages between accounts");
    await this.moveOrCopyMessages(messages, "Move");
    await super.moveMessagesHere(messages);
  }

  async copyMessagesHere(messages: Collection<EWSEMail>) {
    assert(messages.contents.every(message => message.folder.account == this.account), "Cannot copy messages between accounts");
    await this.moveOrCopyMessages(messages, "Copy");
    await super.copyMessagesHere(messages);
  }

  async moveOrCopyMessages(messages: Collection<EWSEMail>, action: string) {
    let request = {
      ["m$" + action + "Item"]: {
        m$ToFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$ItemIds: {
          t$ItemId: messages.contents.map(message => ({
            Id: message.itemID,
          })),
        },
        m$ReturnNewItemIds: false,
      },
    };
    await this.account.callEWS(request);
  }

  async moveFolderHere(folder: EWSFolder) {
    assert(folder.account = this.account, "Cannot move folders between accounts");
    let request = {
      m$MoveFolder: {
        m$ToFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$FolderIds: {
          t$FolderId: {
            Id: folder.id,
          },
        },
      },
    };
    await this.account.callEWS(request);
    await super.moveFolderHere(folder);
  }

  async createSubFolder(name: string): Promise<EWSFolder> {
    let request = {
      m$CreateFolder: {
        m$ParentFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$Folders: {
          t$Folder: {
            t$FolderClass: "IPF.Note",
            t$DisplayName: name,
          },
        },
      },
    };
    let result = await this.account.callEWS(request);
    let folder = await super.createSubFolder(name) as EWSFolder;
    folder.id = result.Folders.Folder.FolderId.Id;
    return folder;
  }

  async rename(name: string) {
    let request = {
      m$UpdateFolder: {
        m$FolderChanges: {
          t$FolderChange: {
            t$FolderId: {
              Id: this.id,
            },
            t$Updates: {
              t$SetFolderField: {
                t$FieldURI: {
                  FieldURI: "folder:DisplayName",
                },
                t$Folder: {
                  t$DisplayName: name,
                },
              },
            },
          },
        },
      },
    };
    await this.account.callEWS(request);
    this.name = name;
  }

  async deleteIt() {
    let request = {
      m$DeleteFolder: {
        m$FolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
        DeleteType: "SoftDelete",
      },
    };
    await this.account.callEWS(request);
    await SQLFolder.deleteIt(this);
    if (this.parent) {
      this.parent.subFolders.remove(this);
    } else {
      this.account.rootFolders.remove(this);
    }
  }

  async markAllRead() {
    let request = {
      m$MarkAllItemsAsRead: {
        m$ReadFlag: true,
        m$SuppressReadREceipts: true,
        m$FolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
      },
    };
    await this.account.callEWS(request);
    await super.markAllRead();
  }
}
