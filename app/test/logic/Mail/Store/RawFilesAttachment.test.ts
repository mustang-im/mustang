// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { setupTestFolder, newTestEMail, addTestAttachment } from "../SQL/setup";
import type { Folder } from "../../../../logic/Mail/Folder";
import type { EMail } from "../../../../logic/Mail/EMail";
import { SQLEMail } from "../../../../logic/Mail/SQL/SQLEMail";
import { getDatabase } from "../../../../logic/Mail/SQL/SQLDatabase";
import { RawFilesAttachment } from "../../../../logic/Mail/Store/RawFilesAttachment";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { beforeAll, expect, test } from "vitest";
import sql from "../../../../../lib/rs-sqlite";

let folder: Folder;
const kContent = new Uint8Array([1, 2, 3]);

beforeAll(async () => {
  let tempDir: string;
  ({ folder, tempDir } = await setupTestFolder({
    getFilesDir: () => path.join(tempDir, "files"),
    // <copied from="desktop/backend/backend.ts">
    async writeFile(filepath: string, permissions: number, contents: Uint8Array): Promise<void> {
      await fsPromises.rm(filepath, { force: true });
      let fileHandle = await fsPromises.open(filepath, "w", permissions);
      await fileHandle.write(contents);
      await fileHandle.close();
    },
    fs: fsPromises,
  }));
});

async function newSavedEMail(msgID: string): Promise<EMail> {
  let email = newTestEMail(folder, msgID);
  email.text = "Hello";
  addTestAttachment(email, "photo.jpg", "<cid1>", kContent);
  await SQLEMail.save(email);
  return email;
}

test("Attachment file is re-written into the read-only dir when the file path was lost", async () => {
  let storage = new RawFilesAttachment();
  let email = await newSavedEMail("msg1@example.com");
  let attachment = email.attachments.first;
  await storage.save(email);
  let filepath = attachment.filepathLocal;
  expect(filepath).toBeTruthy();
  let dirStat = await fsPromises.stat(path.dirname(filepath));
  expect(dirStat.mode & 0o777).toBe(0o500); // dir was made read-only

  // The old bug: file on disk and dir read-only, but the DB lost the file path
  attachment.filepathLocal = null;
  await storage.save(email);
  expect(attachment.filepathLocal).toBe(filepath);
  let written = await fsPromises.readFile(filepath);
  expect(new Uint8Array(written)).toEqual(kContent);
  dirStat = await fsPromises.stat(path.dirname(filepath));
  expect(dirStat.mode & 0o777).toBe(0o500); // read-only again

  // ... and recorded in the DB, so that it stays fixed
  let row = await (await getDatabase()).get(sql`
    SELECT filepathLocal FROM emailAttachment WHERE emailID = ${email.dbID}`) as any;
  expect(row.filepathLocal).toContain("photo");
});

test("Failure to write an attachment file is reported to the caller", async () => {
  let storage = new RawFilesAttachment();
  let email = await newSavedEMail("msg2@example.com");
  let writeFileOrig = appGlobal.remoteApp.writeFile;
  appGlobal.remoteApp.writeFile = async () => {
    throw new Error("Disk full");
  };
  try {
    // So that `saveCompleteMessage()` does not mark the email as complete
    await expect(storage.save(email)).rejects.toThrow("Disk full");
    expect(email.attachments.first.filepathLocal).toBeFalsy();
  } finally {
    appGlobal.remoteApp.writeFile = writeFileOrig;
  }
});
