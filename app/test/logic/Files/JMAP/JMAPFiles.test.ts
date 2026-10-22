import { appGlobal } from "../../../../logic/app";
import { JMAPFileSharingAccount } from "../../../../logic/Files/JMAP/JMAPFileSharingAccount";
import type { JMAPFile } from "../../../../logic/Files/JMAP/JMAPFile";
import type { JMAPDirectory } from "../../../../logic/Files/JMAP/JMAPDirectory";
import { DummyFileStorage } from "../../../../logic/Files/Store/DummyFileStorage";
import { FakeFileNodeServer } from "./fakeFileNodeServer";
import { ArrayColl } from "svelte-collections";
import { mkdtempSync } from "node:fs";
import * as fsPromises from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";

const tempDir = mkdtempSync(path.join(tmpdir(), "mustang-jmap-files-"));
/** Simulates another app that has the file open, and Windows, which then doesn't let us change it */
const lockedPaths = new Set<string>();
function lockedError(): Error {
  return Object.assign(new Error("EBUSY: resource busy or locked"), { code: "EBUSY" });
}
appGlobal.remoteApp = {
  kyCreate: () => { throw new Error("The test should not talk to a real server") },
  getFilesDir: async () => tempDir,
  // Like JPC, which turns the backend's ArrayBuffer into a Uint8Array
  readFile: async (filepath: string) => new Uint8Array(await fsPromises.readFile(filepath)),
  writeFile: async (filepath: string, permissions: number, contents: Uint8Array) => {
    if (lockedPaths.has(filepath)) {
      throw lockedError();
    }
    await fsPromises.rm(filepath, { force: true });
    await fsPromises.writeFile(filepath, contents, { mode: permissions });
  },
  deleteFile: async (filepath: string) => await fsPromises.unlink(filepath),
  statFile: async (filepath: string) => {
    let s = await fsPromises.stat(filepath);
    return { size: s.size, lastMod: s.mtime };
  },
  fs: {
    ...fsPromises,
    rename: async (from: string, to: string) => {
      if (lockedPaths.has(from)) {
        throw lockedError();
      }
      await fsPromises.rename(from, to);
    },
  },
  path: { dirname: path.dirname, join: path.join },
} as any;

async function setup(serverOptions: Partial<FakeFileNodeServer> = {}) {
  let server = new FakeFileNodeServer();
  Object.assign(server, serverOptions);
  let jmapAccount = server.newAccount();
  let files = new JMAPFileSharingAccount();
  files.storage = new DummyFileStorage();
  files.initFromMainAccount(jmapAccount);
  let errors: Error[] = [];
  files.errorCallback = ex => errors.push(ex);
  files.dataError = ex => errors.push(ex);
  appGlobal.fileSharingAccounts.add(files);
  return { server, jmapAccount, files, errors };
}

/** A server with `/Docs/a.txt` */
async function setupWithFile(serverOptions: Partial<FakeFileNodeServer> = {}) {
  let { server, jmapAccount, files, errors } = await setup(serverOptions);
  let docsID = server.addDirectory("Docs");
  let fileID = server.addFile("a.txt", "original", docsID);
  await files.sync();
  let docs = files.rootDir.subDirs.find(dir => dir.nodeID == docsID);
  await docs.listContents();
  let file = docs.files.find(file => file.nodeID == fileID);
  return { server, jmapAccount, files, errors, docs, docsID, file, fileID };
}

async function readDisk(filepath: string): Promise<string> {
  return await fsPromises.readFile(filepath, "utf-8");
}

/** The user changed the file in another app */
async function editOnDisk(file: JMAPFile, contents: string, lastMod = new Date(2026, 9, 21, 14, 3, 59)) {
  await fsPromises.writeFile(file.filepathLocal, contents);
  await fsPromises.utimes(file.filepathLocal, lastMod, lastMod);
}

/** As in the names of the conflict copies: YY-MM-DD-HH-MM-SS, in local time */
function stamp(date: Date): string {
  return [date.getFullYear() % 100, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(number => String(number).padStart(2, "0"))
    .join("-");
}

function setCalls(server: FakeFileNodeServer): Record<string, any>[] {
  return server.calls.filter(([method]) => method == "FileNode/set").map(([, args]) => args);
}

test("Lists the top level nodes and the contents of a directory, in pages", async () => {
  let { server, files, errors } = await setup();
  let docsID = server.addDirectory("Docs");
  server.addDirectory("Photos");
  server.addFile("top.txt", "top");
  for (let name of ["1.txt", "2.txt", "3.txt", "4.txt"]) {
    server.addFile(name, name, docsID);
  }
  server.addDirectory("Sub", docsID);

  await files.sync();
  expect(files.rootDir.path).toBe("/");
  expect(files.rootDir.subDirs.contents.map(dir => dir.name).sort()).toEqual(["Docs", "Photos"]);
  expect(files.rootDir.files.contents.map(file => file.name)).toEqual(["top.txt"]);
  expect(files.jmapAccount.syncState.get("FileNode")).toBe("s" + server.state);

  let docs = files.rootDir.subDirs.find(dir => dir.name == "Docs");
  await docs.listContents();
  expect(docs.path).toBe("/Docs/");
  expect(docs.files.contents.map(file => file.path).sort()).toEqual(["/Docs/1.txt", "/Docs/2.txt", "/Docs/3.txt", "/Docs/4.txt"]);
  expect(docs.subDirs.contents.map(dir => dir.path)).toEqual(["/Docs/Sub/"]);
  expect(docs.files.first.mimetype).toBe("text/plain");
  expect(docs.files.first.size).toBe(5);
  expect(server.calls.filter(([method]) => method == "FileNode/query").length).toBeGreaterThan(2); // maxObjectsInGet is 3
  expect(errors).toEqual([]);
});

test("Ignores symbolic links", async () => {
  let { server, files, errors } = await setup();
  server.nodes.set("link", { "@type": "SymLink", id: "link", parentId: null, name: "link", target: ["x"], modified: "2026-10-01T10:00:00.000Z" });
  server.addFile("top.txt", "top");
  await files.sync();
  expect(files.rootDir.files.contents.map(file => file.name)).toEqual(["top.txt"]);
  expect(files.rootDir.subDirs.isEmpty).toBe(true);
  expect(errors).toEqual([]);
});

test("Reads and writes draft -14 of FileNode, like Stalwart", async () => {
  let { server, docs, file, errors } = await setupWithFile({ draft14: true });
  expect(file.name).toBe("a.txt");
  expect(file.mimetype).toBe("text/plain");

  let sub = await docs.createSubDirectory("New");
  expect(server.nodes.get(sub.nodeID)["@type"]).toBe("Directory");
  let browserFile = docs.newFile("b.txt");
  browserFile.fromBrowserFile(new globalThis.File(["new file"], "b.txt", { type: "text/plain" }));
  await docs.addFile(browserFile);
  let created = server.find("b.txt", docs.nodeID);
  expect(created.mediaType).toBe("text/plain");
  expect(setCalls(server).flatMap(args => Object.values(args.create ?? {}))).toEqual([
    { nodeType: "directory", name: "New", parentId: docs.nodeID },
    expect.objectContaining({ nodeType: "file", type: "text/plain", name: "b.txt" }),
  ]);
  expect(errors).toEqual([]);
});

test("Writes draft -18 of FileNode", async () => {
  let { server, docs, errors } = await setupWithFile();
  await docs.createSubDirectory("New");
  expect(setCalls(server)[0].create).toEqual({ dir: { "@type": "Directory", name: "New", parentId: docs.nodeID } });
  expect(errors).toEqual([]);
});

test("Downloads a file to disk, with the modification time from the server", async () => {
  let { file, files, errors } = await setupWithFile();
  await file.download();
  expect(file.filepathLocal).toBe(`${tempDir}/files/cloud/${files.id}/${file.nodeID}/a.txt`);
  expect(await readDisk(file.filepathLocal)).toBe("original");
  expect((await fsPromises.stat(file.filepathLocal)).mtime.toISOString()).toBe("2026-10-01T10:00:00.000Z");
  expect(await file.isLocalFileChanged()).toBe(false);
  expect(await file.contents.text()).toBe("original");
  expect(errors).toEqual([]);
});

test("When the file changes on the server, the push notification updates the file on disk", async () => {
  let { server, jmapAccount, file, errors } = await setupWithFile();
  await file.download();
  server.changeFile(file.nodeID, "changed on server", "2026-10-20T08:00:00.000Z");

  await jmapAccount.sync("FileNode", "s" + server.state);
  expect(await readDisk(file.filepathLocal)).toBe("changed on server");
  expect((await fsPromises.stat(file.filepathLocal)).mtime.toISOString()).toBe("2026-10-20T08:00:00.000Z");
  expect(await file.isLocalFileChanged()).toBe(false);
  expect(file.lastModOnServer.toISOString()).toBe("2026-10-20T08:00:00.000Z");
  expect(setCalls(server)).toEqual([]);
  expect(errors).toEqual([]);
});

test("A change on disk is uploaded, only if the file on the server is unchanged", async () => {
  let { server, files, file, fileID, errors } = await setupWithFile();
  await file.download();
  let oldBlobID = server.nodes.get(fileID).blobId;
  await editOnDisk(file, "changed on disk");

  await files.syncLocalCopies();
  expect(server.contents(fileID)).toBe("changed on disk");
  expect(server.nodes.get(fileID).modified).toBe(new Date(2026, 9, 21, 14, 3, 59).toISOString());
  expect(setCalls(server)[0].ifUnchangedBy).toEqual({ [fileID]: { blobId: oldBlobID } });
  expect(file.blobID).toBe(server.nodes.get(fileID).blobId);
  expect(await file.isLocalFileChanged()).toBe(false);

  await files.syncLocalCopies(); // Nothing to do
  expect(setCalls(server).length).toBe(1);
  expect(errors).toEqual([]);
});

test("Without draft-ietf-jmap-conditional, `ifInState` guards the upload, and we try again when other files changed", async () => {
  let { server, files, file, fileID, errors } = await setupWithFile({ conditional: false });
  let otherID = server.addFile("other.txt", "other");
  await file.download();
  await editOnDisk(file, "changed on disk");
  let otherClient = true;
  server.beforeSet = () => {
    if (otherClient) {
      server.changeFile(otherID, "changed by somebody else");
      otherClient = false;
    }
  };

  await files.syncLocalCopies();
  expect(server.contents(fileID)).toBe("changed on disk");
  expect(setCalls(server).map(args => !!args.ifInState)).toEqual([true, true]);
  expect(setCalls(server).some(args => args.ifUnchangedBy)).toBe(false);
  expect(errors).toEqual([]);
});

test("Both changed: the file on disk is renamed to -modified-, and gets the server version. Both are on the server.", async () => {
  let { server, files, docs, file, fileID, errors } = await setupWithFile();
  await file.download();
  let originalPath = file.filepathLocal;
  let localDate = new Date(2026, 9, 21, 14, 3, 59);
  await editOnDisk(file, "my version", localDate);
  server.changeFile(fileID, "their version");

  await files.fetchChanges();
  let modifiedName = `a-modified-${stamp(localDate)}.txt`;
  expect(modifiedName).toBe("a-modified-26-10-21-14-03-59.txt");
  expect(await readDisk(originalPath)).toBe("their version");
  expect(await readDisk(path.join(path.dirname(originalPath), modifiedName))).toBe("my version");
  expect(server.contents(fileID)).toBe("their version");
  let copy = server.find(modifiedName, docs.nodeID);
  expect(server.contents(copy.id)).toBe("my version");
  expect(docs.files.contents.map(file => file.name).sort()).toEqual([modifiedName, "a.txt"]);
  let localCopy = docs.files.find(file => file.name == modifiedName);
  expect(localCopy.nodeID).toBe(copy.id);
  expect(await localCopy.isLocalFileChanged()).toBe(false);
  expect(await file.isLocalFileChanged()).toBe(false);

  await files.syncLocalCopies(); // Settled
  expect(setCalls(server).length).toBe(1);
  expect(errors).toEqual([]);
});

test("Both made the same change: No conflict", async () => {
  let { server, files, docs, file, fileID, errors } = await setupWithFile();
  await file.download();
  await editOnDisk(file, "same change");
  server.changeFile(fileID, "same change");

  await files.fetchChanges();
  expect(docs.files.length).toBe(1);
  expect(setCalls(server)).toEqual([]);
  expect(await file.isLocalFileChanged()).toBe(false);
  expect(errors).toEqual([]);
});

test("Both changed, and another app has the file locked: The server version goes into -server-, and the user's version is uploaded", async () => {
  let { server, files, docs, file, fileID, errors } = await setupWithFile();
  await file.download();
  let originalPath = file.filepathLocal;
  await editOnDisk(file, "my version");
  let serverDate = new Date(2026, 9, 20, 9, 8, 7);
  server.changeFile(fileID, "their version", serverDate.toISOString());
  let theirBlobID = server.nodes.get(fileID).blobId;
  lockedPaths.add(originalPath);
  try {
    await files.fetchChanges();
  } finally {
    lockedPaths.delete(originalPath);
  }

  let serverName = `a-server-${stamp(serverDate)}.txt`;
  expect(await readDisk(originalPath)).toBe("my version");
  expect(await readDisk(path.join(path.dirname(originalPath), serverName))).toBe("their version");
  expect(server.contents(fileID)).toBe("my version");
  let copy = server.find(serverName, docs.nodeID);
  expect(copy.blobId).toBe(theirBlobID); // no upload needed
  expect(docs.files.contents.map(file => file.name).sort()).toEqual([serverName, "a.txt"]);
  expect(await file.isLocalFileChanged()).toBe(false);
  expect(errors).toEqual([]);
});

test("While another app has the file locked, a change on the server waits", async () => {
  let { server, files, file, fileID, errors } = await setupWithFile();
  await file.download();
  server.changeFile(fileID, "changed on server");
  let downloads = 0;
  let downloadBlob = files.jmapAccount.downloadBlob;
  files.jmapAccount.downloadBlob = async (...args) => {
    downloads++;
    return await downloadBlob(...args);
  };
  lockedPaths.add(file.filepathLocal);
  try {
    await files.fetchChanges();
    await files.syncLocalCopies();
    expect(await readDisk(file.filepathLocal)).toBe("original");
  } finally {
    lockedPaths.delete(file.filepathLocal);
  }
  await files.syncLocalCopies();
  expect(await readDisk(file.filepathLocal)).toBe("changed on server");
  expect(downloads).toBe(1);
  expect(errors).toEqual([]);
});

test("Deleted on the server, but changed on disk: The user's version is kept as -modified- file", async () => {
  let { server, files, docs, file, fileID, errors } = await setupWithFile();
  await file.download();
  let localDate = new Date(2026, 9, 21, 14, 3, 59);
  await editOnDisk(file, "my version", localDate);
  server.destroy(fileID);

  await files.fetchChanges();
  let modifiedName = `a-modified-${stamp(localDate)}.txt`;
  let copy = server.find(modifiedName, docs.nodeID);
  expect(server.contents(copy.id)).toBe("my version");
  expect(docs.files.contents.map(file => file.name)).toEqual([modifiedName]);
  expect(await readDisk(docs.files.first.filepathLocal)).toBe("my version");
  expect(errors).toEqual([]);
});

test("A directory deleted on the server keeps the files that the user changed, in its parent", async () => {
  let { server, files, docs, docsID, file, errors } = await setupWithFile();
  await file.download();
  await editOnDisk(file, "my version");
  server.destroy(docsID);

  await files.fetchChanges();
  expect(files.rootDir.subDirs.contents).toEqual([]);
  let copy = [...server.nodes.values()].find(node => node.name.startsWith("a-modified-"));
  expect(copy.parentId).toBe(null);
  expect(server.contents(copy.id)).toBe("my version");
  expect(files.rootDir.files.contents.map(file => file.name)).toEqual([copy.name]);
  expect(errors).toEqual([]);
});

test("Deleted on the server, unchanged on disk: Deleted on disk too", async () => {
  let { server, files, docs, file, fileID, errors } = await setupWithFile();
  await file.download();
  let filepath = file.filepathLocal;
  server.destroy(fileID);

  await files.fetchChanges();
  expect(docs.files.isEmpty).toBe(true);
  await expect(fsPromises.stat(filepath)).rejects.toThrow();
  expect(setCalls(server)).toEqual([]);
  expect(errors).toEqual([]);
});

test("The user deleted the file on disk: It's only our copy, so it stays on the server", async () => {
  let { server, files, file, fileID, errors } = await setupWithFile();
  await file.download();
  await fsPromises.unlink(file.filepathLocal);

  await files.syncLocalCopies();
  expect(file.filepathLocal).toBe(null);
  expect(server.nodes.has(fileID)).toBe(true);
  expect(errors).toEqual([]);
});

test("A file that vanished from a directory listing was moved, not deleted", async () => {
  let { server, docs, file, fileID, errors } = await setupWithFile();
  await file.download();
  let filepath = file.filepathLocal;
  let otherID = server.addDirectory("Other");
  let deepID = server.addDirectory("Deep", otherID);
  server.update(fileID, { parentId: deepID });

  await docs.listContents();
  expect(docs.files.isEmpty).toBe(true);
  expect(file.parent.nodeID).toBe(deepID);
  expect(file.path).toBe("/Other/Deep/a.txt");
  expect(file.filepathLocal).toBe(filepath);
  expect(await readDisk(filepath)).toBe("original");
  expect(errors).toEqual([]);
});

test("Rename, move, copy and delete on the server", async () => {
  let { server, files, docs, file, fileID, errors } = await setupWithFile();
  let other = await files.rootDir.createSubDirectory("Other");
  expect(server.find("Other").id).toBe(other.nodeID);

  file.name = "b.txt";
  await file.save();
  expect(server.nodes.get(fileID).name).toBe("b.txt");
  expect(file.path).toBe("/Docs/b.txt");

  docs.name = "Documents";
  await docs.save();
  expect(server.nodes.get(docs.nodeID).name).toBe("Documents");
  expect(file.path).toBe("/Documents/b.txt");

  await other.copyFilesHere(new ArrayColl([file]));
  let copy = server.find("b.txt", other.nodeID);
  expect(copy.blobId).toBe(server.nodes.get(fileID).blobId);
  expect(other.files.contents.map(file => file.nodeID)).toEqual([copy.id]);

  await other.copyFilesHere(new ArrayColl([file]));
  expect(other.files.contents.map(file => file.name).sort()).toEqual(["b (2).txt", "b.txt"]);

  await expect(other.moveFilesHere(new ArrayColl([file]))).rejects.toThrow(); // b.txt is taken
  expect(server.nodes.get(fileID).parentId).toBe(docs.nodeID);
  expect(docs.files.contents).toEqual([file]);

  let third = await files.rootDir.createSubDirectory("Third");
  await third.moveFilesHere(new ArrayColl([file]));
  expect(server.nodes.get(fileID).parentId).toBe(third.nodeID);
  expect(docs.files.isEmpty).toBe(true);
  expect(file.parent).toBe(third);
  expect(file.path).toBe("/Third/b.txt");

  await file.deleteIt();
  expect(server.nodes.has(fileID)).toBe(false);
  expect(third.files.contains(file)).toBe(false);

  await other.deleteIt();
  expect(server.nodes.has(other.nodeID)).toBe(false);
  expect(server.nodes.has(copy.id)).toBe(false);
  expect(files.rootDir.subDirs.contains(other)).toBe(false);
  expect(errors).toEqual([]);
});

test("A rename that the server rejects shows the name on the server again", async () => {
  let { server, docs, file, fileID } = await setupWithFile();
  server.addFile("taken.txt", "x", docs.nodeID);
  await docs.listContents();
  file.name = "taken.txt";
  await expect(file.save()).rejects.toThrow();
  expect(file.name).toBe("a.txt");
  expect(server.nodes.get(fileID).name).toBe("a.txt");
});

test("Changes on the server move, rename and add nodes in the directories that we listed", async () => {
  let { server, files, docs, file, fileID, docsID, errors } = await setupWithFile();
  let newID = server.addFile("new.txt", "new", docsID);
  let subID = server.addDirectory("Sub", docsID);
  server.update(docsID, { name: "Documents" });
  server.update(fileID, { name: "renamed.txt", parentId: subID });

  await files.fetchChanges();
  expect(docs.name).toBe("Documents");
  expect(docs.files.contents.map(file => file.nodeID)).toEqual([newID]);
  let sub = docs.subDirs.find(dir => dir.nodeID == subID);
  expect(sub.files.contents).toEqual([file]);
  expect(file.path).toBe("/Documents/Sub/renamed.txt");
  expect(errors).toEqual([]);
});

test("When the server lost our sync state, we list again all directories that we know", async () => {
  let { server, files, docs, file, errors } = await setupWithFile();
  let newID = server.addFile("new.txt", "new", docs.nodeID);
  files.jmapAccount.syncState.set("FileNode", "s0");

  await files.fetchChanges();
  expect(docs.files.contents.map(file => file.nodeID).sort()).toEqual([file.nodeID, newID].sort());
  expect(files.jmapAccount.syncState.get("FileNode")).toBe("s" + server.state);
  expect(errors).toEqual([]);
});

test("A server that makes a directory its own subdirectory doesn't break our tree", async () => {
  let { server, files, docs, docsID, errors } = await setupWithFile();
  let subID = server.addDirectory("Sub", docsID);
  await docs.listContents();
  server.update(docsID, { parentId: subID });

  await files.fetchChanges();
  expect(docs.parent).toBe(files.rootDir);
  expect(errors.length).toBe(1);
  expect(files.allDirectories().length).toBe(3);
});

test("The node ID and the state of the file on disk survive a restart", async () => {
  let { file } = await setupWithFile();
  await file.download();
  let json = JSON.parse(JSON.stringify(file.toExtraJSON()));
  let restored = file.parent.newFile("a.txt");
  restored.fromExtraJSON(json);
  expect(restored.nodeID).toBe(file.nodeID);
  expect(restored.localCopy).toEqual(file.localCopy);

  let dirJSON = JSON.parse(JSON.stringify(file.parent.toExtraJSON()));
  let restoredDir = file.parent.parent.newDirectory("Docs");
  restoredDir.fromExtraJSON(dirJSON);
  expect(restoredDir.nodeID).toBe(file.parent.nodeID);
});
