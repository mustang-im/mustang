import MsgFolder from "../account/MsgFolder";
import { assert } from "../../util/util";


/**
 * A folder that redirects all calls to either a local cache (e.g. SQLFolder)
 * or to the server protocol implementation (e.g. IMAPFolder).
 */
export default class CachedFolder extends MsgFolder {
  constructor(baseFolder, cacheFolder) {
    assert(baseFolder instanceof MsgFolder);
    assert(cacheFolder instanceof MsgFolder);

    super(baseFolder.name, baseFolder.fullPath, baseFolder.account, baseFolder.parentFolder);

    /**
     * The server protocol implementation, e.g. IMAPFolder
     */
    this.baseFolder = baseFolder;
    /**
     * The cache implementation, e.g. SQLFolder
     */
    this.cacheFolder = cacheFolder;
    this._cacheReadDone = false;

    /**
    * Listen to changes in base folder and write them to the local cache.
    *
    * Note that cacheFolder holds a superset of baseFolder, when the
    * baseFolder has not yet logged in or, to save bandwidth,
    * has not retrieved all old messages in its current object instance,
    * but the cached folder knows the older messages.
    */
    this.baseFolder.messages.registerObserver({
      added: async msgs => this.cacheFolder.addMessages(msgs),
      removed: async msgs => this.cacheFolder.removeMessages(msgs),
    });
    this.baseFolder.folders.registerObserver({
      added: async folders => this.cacheFolder.addFolders(folders),
      removed: async folders => this.cacheFolder.removeFolders(folders),
    });
  }

  get messages() {
    return this.cacheFolder.messages;
  }

  get folders() {
    return this.cacheFolder.folders;
  }

  async fetch(state) {
    if (!this._cacheReadDone) {
      await this.cacheFolder.fetch();
      this._cacheReadDone = true;
    }

    //this.cacheFolder.syncState = await this.baseFolder.fetch(this.cacheFolder.syncState); TODO
    await this.baseFolder.sync(this);
  }

  async getMessagesMetadata(offset, limit) {
    // TODO: If not in cache, get them from baseFolder. Ditto below.
    return this.cacheFolder.getMessagesMetadata(offset, limit);
  }

  async getMessagesBodies(offset, limit) {
    return this.cacheFolder.getMessagesBodies(offset, limit);
  }

  async getMessagesComplete(offset, limit) {
    return this.cacheFolder.getMessagesComplete(offset, limit);
  }

  async createMessage() {
    await this.baseFolder.createMessage();
  }

  async deleteMessages(messages, toTrash) {
    await this.baseFolder.deleteMessages(messages, toTrash);
    // the listeners will also do the operation in the cache
  }

  async copyMessages(messages, targetFolder) {
    await this.baseFolder.copyMessages(messages, targetFolder);
    // the listeners will also do the operation in the cache
  }

  async moveMessages(messages, targetFolder) {
    await this.baseFolder.moveMessages(messages, targetFolder);
    // the listeners will also do the operation in the cache
  }

  async updateMessagesMetadata(messages, flags) {
    await this.baseFolder.updateMessagesMetadata(messages, flags);
  }

  async deleteFolder(toTrash) {
    await this.baseFolder.deleteFolder(toTrash);
    await this.cacheFolder.deleteFolder(toTrash);
  }

  async moveFolder(newParent) {
    await this.baseFolder.moveFolder(newParent);
    await this.cacheFolder.moveFolder(newParent);
  }

  async renameFolder(newName) {
    await this.baseFolder.renameFolder(newName);
    await this.cacheFolder.renameFolder(newName);
  }

  async emptyTrash() {
    await this.baseFolder.emptyTrash();
    await this.cacheFolder.emptyTrash();
  }
}
