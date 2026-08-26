// FileReader, which we use to read the picture file
// @vitest-environment happy-dom

// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { EWSAddressbook } from "../../../../logic/Contacts/EWS/EWSAddressbook";
import { EWSPerson } from "../../../../logic/Contacts/EWS/EWSPerson";
import { beforeEach, expect, test } from "vitest";

/** A picture that the user picked from a file, here a 1x1 PNG */
const kPictureBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGP4DwABAQEANl9ngAAAAABJRU5ErkJggg==";
const kFilePicture = "data:image/png;base64," + kPictureBase64;
/** The same picture, as Exchange returns it */
const kServerPicture = "data:image/jpeg;base64," + kPictureBase64;
const kItemID = "contact-item";
const kAttachmentID = "picture-attachment";
const kNewAttachmentID = "new-picture-attachment";

/** Answers like Exchange does, and remembers the requests */
function fakeAccount(): any {
  return {
    errorCallback: (ex: Error) => { throw ex; },
    requests: [] as any[],
    async callEWS(request: any) {
      this.requests.push(request);
      if (request.m$GetAttachment) {
        return {
          Attachments: {
            FileAttachment: {
              AttachmentId: { Id: request.m$GetAttachment.m$AttachmentIds.t$AttachmentId.Id },
              Name: "ContactPicture.jpg",
              ContentType: "image/jpeg",
              IsContactPhoto: "true",
              Content: kPictureBase64,
            },
          },
        };
      }
      if (request.m$CreateAttachment) {
        return {
          Attachments: {
            FileAttachment: {
              AttachmentId: { Id: kNewAttachmentID },
            },
          },
        };
      }
      if (request.m$DeleteAttachment) {
        return {};
      }
      return { Items: { Contact: { ItemId: { Id: kItemID } } } };
    },
  };
}

/** A contact, as `XML2JSON()` returns it */
function contactXML(pictureAttachmentID?: string): any {
  let contact: any = {
    ItemId: { Id: kItemID },
    DisplayName: "Alice Example",
    GivenName: "Alice",
    Surname: "Example",
  };
  if (pictureAttachmentID) {
    contact.Attachments = {
      FileAttachment: {
        AttachmentId: { Id: pictureAttachmentID },
        Name: "ContactPicture.jpg",
        ContentType: "image/jpeg",
        IsContactPhoto: "true",
        Size: "70",
      },
    };
  }
  return contact;
}

let addressbook: EWSAddressbook;
let account: any;

beforeEach(() => {
  addressbook = new EWSAddressbook();
  account = addressbook.mainAccount = fakeAccount();
  addressbook.folderID = "contacts-folder";
});

function requestsOfType(type: string): any[] {
  return account.requests.filter(request => request[type]);
}

test("reads the picture of the contact", async () => {
  let person = new EWSPerson(addressbook);

  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  expect(person.picture).toBe(kServerPicture);
  expect(person.pictureAttachmentID).toBe(kAttachmentID);
  expect(requestsOfType("m$GetAttachment").length).toBe(1);
});

test("downloads the picture only when it changed", async () => {
  let person = new EWSPerson(addressbook);
  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  // Next sync
  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  expect(person.picture).toBe(kServerPicture);
  expect(requestsOfType("m$GetAttachment").length).toBe(1);
});

test("removes the picture that the server deleted", async () => {
  let person = new EWSPerson(addressbook);
  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  person.fromXML(contactXML(null));
  await person.downloadPictureFromServer();

  expect(person.picture).toBe(null);
  expect(person.pictureAttachmentID).toBe("");
});

test("saves a new picture as attachment of the contact", async () => {
  let person = new EWSPerson(addressbook);
  person.name = "Alice Example";
  person.picture = kFilePicture;

  await person.saveToServer();

  expect(person.itemID).toBe(kItemID);
  let creates = requestsOfType("m$CreateAttachment");
  expect(creates.length).toBe(1);
  let attachment = creates[0].m$CreateAttachment.m$Attachments.t$FileAttachment;
  expect(creates[0].m$CreateAttachment.m$ParentItemId.Id).toBe(kItemID);
  expect(attachment.t$IsContactPhoto).toBe(true);
  expect(attachment.t$Name).toBe("ContactPicture.jpg");
  expect(attachment.t$ContentType).toBe("image/png");
  expect(attachment.t$Content).toBe(kPictureBase64);
  expect(person.pictureAttachmentID).toBe(kNewAttachmentID);
});

test("uploads the picture only when the user changed it", async () => {
  let person = new EWSPerson(addressbook);
  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  person.name = "Alice Sample";
  await person.saveToServer();

  expect(requestsOfType("m$CreateAttachment").length).toBe(0);
  expect(requestsOfType("m$DeleteAttachment").length).toBe(0);
});

test("replaces the old picture on the server", async () => {
  let person = new EWSPerson(addressbook);
  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  person.picture = kFilePicture;
  await person.saveToServer();

  let deletes = requestsOfType("m$DeleteAttachment");
  expect(deletes.length).toBe(1);
  expect(deletes[0].m$DeleteAttachment.m$AttachmentIds.t$AttachmentId.Id).toBe(kAttachmentID);
  expect(requestsOfType("m$CreateAttachment").length).toBe(1);
  expect(person.pictureAttachmentID).toBe(kNewAttachmentID);
});

test("deletes the picture on the server", async () => {
  let person = new EWSPerson(addressbook);
  person.fromXML(contactXML(kAttachmentID));
  await person.downloadPictureFromServer();

  person.picture = null;
  await person.saveToServer();

  expect(requestsOfType("m$DeleteAttachment").length).toBe(1);
  expect(requestsOfType("m$CreateAttachment").length).toBe(0);
  expect(person.pictureAttachmentID).toBe("");
});
