import { EMail } from "../EMail";
import type { DelegateFolder } from "./DelegateFolder";
import type { Folder } from "../Folder";
import type { ArrayColl, MapColl } from "svelte-collections";
import type { PersonEmailAddress } from "../EMail";
import type { Attachment } from "../Attachment";

export class DelegateEMail extends EMail {
  base: EMail;
  folder: DelegateFolder;

  constructor(folder: DelegateFolder, base: EMail) {
    super(folder as any as Folder);
    this.base = base;
  }

  get pID() {
    return base.pID;
  }
  set pID(val) {
    base.pID = val;
  }

  async download() {
    await this.base.download();
  }

  async markRead(read = true) {
    await this.base.markRead(read);
  }

  async markStarred(starred = true) {
    await this.base.markStarred(starred);
  }

  async markSpam(spam = true) {
    await this.base.markSpam(spam);
  }

  async markReplied() {
    await this.base.markReplied();
  }

  async markDraft() {
    await this.base.markDraft();
  }

  /**
   * Set read/starred etc. flag on the message
   *
   * @param name -- the flag, e.g. "\Seen", "\Recent", "\Junk" etc.
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlag(name: string, set = true) {
    await this.base.setFlag(name, set);
  }

  async send(): Promise<void> {
    await this.base.send();
  }

  async deleteMessage() {
    await super.deleteMessage();
    await this.base.deleteMessage();
  }

  get id(): string {
    return this.base.id;
  }
  set id(val: string) {
    this.base.id = val;
  }

  get messageID(): string {
    return this.base.messageID;
  }
  set messageID(val: string) {
    this.base.messageID = val;
  }

  get inReplyTo(): string | undefined {
    return this.base.inReplyTo;
  }
  set inReplyTo(val: string | undefined) {
    this.base.inReplyTo = val;
  }

  get subject(): string {
    return this.base.subject;
  }
  set subject(val: string) {
    this.base.subject = val;
  }

  get text(): string {
    return this.base.text;
  }
  set text(val: string) {
    this.base.text = val;
  }

  get html(): string {
    return this.base.html;
  }
  set html(val: string) {
    this.base.html = val;
  }

  get size(): number {
    return this.base.size;
  }
  set size(val: number) {
    this.base.size = val;
  }

  get sent(): Date {
    return this.base.sent;
  }
  set sent(val: Date) {
    this.base.sent = val;
  }

  get received(): Date {
    return this.base.received;
  }
  set received(val: Date) {
    this.base.received = val;
  }

  get outgoing(): boolean {
    return this.base.outgoing;
  }
  set outgoing(val: boolean) {
    this.base.outgoing = val;
  }

  get contact(): Contact {
    return this.base.contact;
  }
  set contact(val: Contact) {
    this.base.contact = val;
  }

  get from(): PersonEmailAddress {
    return this.base.from;
  }
  set from(val: PersonEmailAddress) {
    this.base.from = val;
  }

  get replyTo(): PersonEmailAddress {
    return this.base.replyTo;
  }
  set replyTo(val: PersonEmailAddress) {
    this.base.replyTo = val;
  }

  get to(): ArrayColl<PersonEmailAddress> {
    return this.base.to;
  }
  get cc(): ArrayColl<PersonEmailAddress> {
    return this.base.cc;
  }
  get bcc(): ArrayColl<PersonEmailAddress> {
    return this.base.bcc;
  }
  get attachments(): ArrayColl<Attachment> {
    return this.base.attachments;
  }
  get headers(): MapColl<string, string> {
    return this.base.headers;
  }

  get subject(): string {
    return this.base.subject;
  }
  set subject(val: string) {
    this.base.subject = val;
  }
  get baseSubject(): string {
    return this.base.baseSubject
  }

  get isNewArrived(): boolean {
    return this.base.isNewArrived;
  }
  set isNewArrived(val: boolean) {
    this.base.isNewArrived = val;
  }

  get isRead(): boolean {
    return this.base.isRead;
  }
  get isStarred(): boolean {
    return this.base.isStarred;
  }
  get isSpam(): boolean {
    return this.base.isSpam;
  }
  get isReplied(): boolean {
    return this.base.isReplied;
  }
  get isDraft(): boolean {
    return this.base.isDraft;
  }
  get isSpam(): boolean {
    return this.base.isSpam;
  }
  get mime(): Uint8Array | undefined {
    return this.base.mime;
  }
  get downloadComplete(): boolean {
    return this.base.downloadComplete;
  }
  get needSave(): boolean {
    return this.base.needSave;
  }
}
