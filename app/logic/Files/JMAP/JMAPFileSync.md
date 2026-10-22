# Files on disk and on the JMAP server

When the user opens a file of a JMAP account, we download it to disk, and the user edits it there with another app.
This describes how `JMAPFile.syncLocalCopy()` keeps the file on disk and the file on the server in sync.

## What we store

- The file on disk is `<files dir>/files/cloud/<account ID>/<FileNode ID>/<name>`.
  One directory per FileNode, so a rename or move on the server doesn't move the file on disk while another app has it open,
  and two names that are the same after sanitizing, e.g. `Report (1).docx` and `Report 1.docx`, don't share a file.
- When we write the file to disk, we set its modification time to the `modified` time on the server.
- `JMAPFile.localCopy` is the state of the file on disk, when we last wrote it or uploaded it:
  - `blobID`: The server version that the file on disk is based on
  - `lastMod` and `size` of the file on disk
- `JMAPFile.blobID` is the current version on the server.
  Blobs never change, so a new blob ID means new contents.

## When we sync

- The server sends a push notification for `FileNode`. We fetch the changes with `FileNode/changes`, and sync the changed files that we have on disk.
- Every minute, we sync all files that we have on disk, because we get no notification when another app changes them. This also retries what failed.
- At login, and with the Refresh button.
- When the user opens the file.

## How we notice changes

- **Changed on disk**: The size or the modification time (in seconds) differs from `localCopy`.
- **Changed on the server**: `blobID` differs from `localCopy.blobID`.
- The user deleted the file on disk: It was only our copy, so we forget it, and the file on the server stays.

## What we do

| On disk | On the server | Then |
|---|---|---|
| unchanged | unchanged | nothing |
| changed | unchanged | Upload, but only if the server still has the version that the file on disk is based on, see below |
| unchanged | changed | Download, and replace the file on disk. If another app has the file locked, try again in the next round. |
| changed | changed | Conflict, see below |
| changed | deleted | Keep it, see below |
| unchanged | deleted | Delete it on disk |

### Upload only if unchanged on the server

- With draft-ietf-jmap-conditional: `FileNode/set` with `ifUnchangedBy: { <id>: { blobId: <localCopy.blobID> } }`.
- Without it, e.g. Stalwart: `FileNode/get` the `blobId`, compare it, then `FileNode/set` with `ifInState` set to the state of that `get`.
  `ifInState` also fails when another file changed in the meantime, so we try up to 5 times.

If somebody else changed the file in the meantime, we get the new version and continue with the conflict.

### Conflict

The user changed the file on disk, and somebody else changed it differently on the server.

1. Download the server version. If it's the same as the file on disk, both made the same change, and we're done.
2. Rename the file on disk to `<name>-modified-<YY-MM-DD-HH-MM-SS>.<ext>`, with the modification time of the file on disk, in local time.
   E.g. `Report-modified-26-10-21-14-03-59.docx`.
3. Write the server version to the original name on disk.
4. Upload the `-modified-` file to the server, as new file in the same directory.

If the rename fails, because another app has the file open and locked it (on Windows), then:

1. Write the server version to a new file `<name>-server-<YY-MM-DD-HH-MM-SS>.<ext>` on disk, with the modification time on the server, in local time.
2. Create it on the server as new file in the same directory, with the blob of the server version (no upload).
3. The file on disk keeps the user's version. It's now based on the server version, so the next round uploads it.

Either way, both versions are then on disk and on the server, as two files, so the user sees both in the app and on other devices.
If a name is already taken, we put a number before the name on disk, and the server picks a free name.

### Deleted on the server, but changed on disk

We keep the user's changes: Rename the file on disk to `<name>-modified-<YY-MM-DD-HH-MM-SS>.<ext>` (unless it's locked),
and upload it as new file, into the same directory, or, if that was deleted too, into the closest parent directory that still exists.

### Rounds

A sync of a file runs until nothing changed in the last step, at most 5 rounds.
E.g. an upload finds that the server changed the file in the meantime, so the next round handles the conflict.
