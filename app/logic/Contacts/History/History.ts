import type { Person } from "../../Abstract/Person";
import { Message } from "../../Abstract/Message";
import type { EMail } from "../../Mail/EMail";
import type { ChatMessage } from "../../Chat/Message";
import { VideoConfMeeting } from "../../Meet/VideoConfMeeting";
import { Event } from "../../Calendar/Event";
import { File } from "../../Files/File";
import { newSearchEMail } from "../../Mail/Store/setStorage";
import { newSearchChat } from "../../Chat/AccountsList/ChatAccounts";
import { ArrayColl, Collection, mergeColls } from "svelte-collections";
import { showError } from "../../../frontend/Util/error";
import { appGlobal } from "../../app";

export type LogEntry = Message | File | Event | VideoConfMeeting; // & { time: Date }

export function searchLog(person: Person, limit: number): Collection<LogEntry> {
  let colls = new ArrayColl<Collection<LogEntry>>();
  addColl(colls, getEMails(person, limit));
  // addColl(colls, getChatMessages(person, limit));
  addColl(colls, getCalendarEvents(person, limit));
  const old = new Date(0);
  return mergeColls(colls).sortBy((entry: LogEntry) => {
    let time =
      entry instanceof Message ? entry.sent :
        entry instanceof File ? entry.lastMod :
          entry instanceof Event ? entry.startTime :
            entry instanceof VideoConfMeeting ? entry.started ?? entry.event?.startTime :
              old;
    (entry as any)._history_time = time;
    return -time.getTime();
  });
}

function addColl(colls: ArrayColl<Collection<LogEntry>>, func: Promise<Collection<LogEntry>>) {
  func
    .then(coll => colls.add(coll))
    .catch(showError);
}

async function getEMails(person: Person, limit: number): Promise<Collection<EMail | File>> {
  let search = newSearchEMail();
  search.includesPerson = person;
  let emails = await search.startSearch(limit);
  let results = new ArrayColl<EMail | File>();
  if (!emails.hasItems) {
    return results;
  }
  results.addAll(emails);

  // Attachments as separate files entries
  for (let email of emails) {
    for (let attachment of email.attachments) {
      if (attachment.hidden) {
        continue;
      }
      let file = attachment.asFileEntry();
      file.lastMod = email.sent;
      results.add(file);
    }
  }
  return results;
}

async function getChatMessages(person: Person, limit: number): Promise<Collection<ChatMessage>> {
  let search = newSearchChat();
  search.includesPerson = person;
  return await search.startSearch(limit);
}

async function getCalendarEvents(person: Person, limit: number): Promise<Collection<Event>> {
  let events = new ArrayColl<Event>();
  for (let event of appGlobal.calendarEvents) {
    if (event.participants.hasItems &&
        event.participants.find(puid => puid.matchesPerson(person))) {
      events.add(event);
    }
  }
  return events;
}
