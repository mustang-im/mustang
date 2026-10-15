import type { Person } from "../../../logic/Abstract/Person";
import type { Tag } from "../../../logic/Abstract/Tag";
import type { SearchOptions, SearchScope } from "./MailSearch";
import { ReceivedRange, ReceivedRanges, SizeRange } from "./SearchRanges";

export enum ReadStatus {
  All = "all",
  Read = "read",
  Unread = "unread",
}

export class AdvancedSearchDraft {
  scope: SearchScope;
  keywords: string;
  person: Person | null;
  isOutgoing: boolean | null;
  readStatus: ReadStatus;
  hasAttachment: boolean;
  flagged: boolean;
  replied: boolean;
  tags: Tag[];
  size: SizeRange;
  startDate: string;
  endDate: string;
  protected received: ReceivedRange;
  protected receivedStart: Date | null;
  protected receivedEnd: Date | null;
  protected shownStartDate: string;
  protected shownEndDate: string;
  protected threadID: string | null;

  constructor(options: SearchOptions, keywords: string | null, now = new Date()) {
    this.scope = options.scope;
    this.keywords = keywords ?? "";
    this.person = options.person;
    this.isOutgoing = options.isOutgoing;
    this.readStatus = options.isRead == null ? ReadStatus.All : options.isRead ? ReadStatus.Read : ReadStatus.Unread;
    this.hasAttachment = options.hasAttachment;
    this.flagged = options.flagged;
    this.replied = options.replied;
    this.tags = [...options.tags];
    this.size = options.size;
    this.received = options.received;
    this.receivedStart = options.receivedStart;
    this.receivedEnd = options.receivedEnd;
    this.threadID = options.threadID;
    let dates = ReceivedRanges.dates(options.received, now, options.receivedStart, options.receivedEnd);
    this.startDate = this.shownStartDate = ReceivedRanges.inputValue(dates.start);
    this.endDate = this.shownEndDate = ReceivedRanges.inputValue(dates.end);
  }

  get from(): Person | null {
    return this.isOutgoing === true ? null : this.person;
  }

  get to(): Person | null {
    return this.isOutgoing === true ? this.person : null;
  }

  setFrom(person: Person | null) {
    if (person) {
      this.person = person;
      this.isOutgoing = false;
    } else if (this.from) {
      this.person = null;
      this.isOutgoing = null;
    }
  }

  setTo(person: Person | null) {
    if (person) {
      this.person = person;
      this.isOutgoing = true;
    } else if (this.to) {
      this.person = null;
      this.isOutgoing = null;
    }
  }

  toggleTag(tag: Tag) {
    this.tags = this.tags.includes(tag)
      ? this.tags.filter(existing => existing != tag)
      : [...this.tags, tag];
  }

  clear() {
    this.keywords = "";
    this.person = null;
    this.isOutgoing = null;
    this.readStatus = ReadStatus.All;
    this.hasAttachment = false;
    this.flagged = false;
    this.replied = false;
    this.tags = [];
    this.size = SizeRange.Any;
    this.startDate = "";
    this.endDate = "";
    this.threadID = null;
  }

  toOptions(): SearchOptions {
    let options: SearchOptions = {
      scope: this.scope,
      person: this.person,
      isOutgoing: this.isOutgoing,
      isRead: this.readStatus == ReadStatus.All ? null : this.readStatus == ReadStatus.Read,
      hasAttachment: this.hasAttachment,
      flagged: this.flagged,
      replied: this.replied,
      tags: [...this.tags],
      received: this.received,
      receivedStart: this.receivedStart,
      receivedEnd: this.receivedEnd,
      size: this.size,
      threadID: this.threadID,
    };
    if (this.startDate != this.shownStartDate || this.endDate != this.shownEndDate) {
      let start = ReceivedRanges.parseInputValue(this.startDate);
      let end = ReceivedRanges.parseInputValue(this.endDate);
      options.received = start || end ? ReceivedRange.Custom : ReceivedRange.Any;
      options.receivedStart = start;
      options.receivedEnd = end;
    }
    return options;
  }

  get searchTerm(): string | null {
    return this.keywords.trim() || null;
  }
}
