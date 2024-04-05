import sql from "../../../../lib/rs-sqlite/index";

export const contactsDatabaseSchema = sql`
  CREATE TABLE "calendar" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT UNIQUE,
    "name" TEXT UNIQUE,
    "protocol" TEXT not null,
    "url" TEXT default null,
    "username" TEXT default null,
    -- Email address to use when sending invitations to other participants.
    -- Optional. Defaults to the user's default email address.
    "from" TEXT default null,
    -- Background color to use when displaying events from this calendar.
    -- Can be overridden by a specific event.
    -- Format: HTML hex code without "#"
    -- Optional. Defaults to the default color for events.
    "color" TEXT default null,
    "workspace" TEXT default null
  );

  --- Meetings scheduled at a specific date/time
  CREATE TABLE "event" (
    "id" INTEGER PRIMARY KEY,
    "calendarID" INTEGER default null,
    -- Summary or subject of the event
    -- Plaintext
    "title" TEXT not null,
    -- Meeting agenda, reasons for the meeting etc.
    -- As HTML fragment, only the part inside HTML body
    "descriptionHTML" TEXT default null,
    -- Plaintext version of the description. Content MUST semantically match the HTML version.
    "descriptionText" TEXT default null,
    -- ISO-8601 datetime when the meeting starts/ends
    -- If start time is null, it's a task
    "startTime" TEXT default null,
    "endTime" TEXT default null,
    -- Timezone, as 3/4-letter abbreviation
    "startTimeTZ" TEXT default null,
    "endTimeTZ" TEXT default null,
    -- Ignore the time component, use only the day component. Event starts at 0:00 and ends 23:59.
    "allDay" BOOLEAN default false,
    -- Webpage where to join the video conference.
    -- Used internally to determine the video conference protocol and meeting ID to be used.
    "onlineMeetingURL" TEXT default null,
    -- Conference zoom, street address etc.
    "physicalLocation" TEXT default null,
    -- If physical location is set, optionally contains the GPS coordinates of it
    -- e.g. "48.85299;2.36885"
    "gps" TEXT default null,
    -- ISO-8601 datetime when to remind the user
    "alarm" TEXT default null,
    -- Who scheduled the meeting.
    -- If our user scheduled the event with other participants (see table "eventParticipant"),
    -- this is set to our user's email address that was used to send the invitation.
    -- Format: "Real Name <emailaddress@example.com>"
    -- If null, it's a private event of our user, not including other people.
    "organizer" TEXT default null,
    -- Background color for this event, set by the user specifically for this event.
    -- Format: HTML hex code without "#"
    -- Optional. If null, the background color will be determined by the calendar.
    "color" TEXT default null,
    -- If this is a recurring (repeating) meeting and this is the master, contains the RRule.
    -- For non-repeating events, this is null. For recurring instances, this is null and "recurrenceMaster" is set.
    -- Format: iCalendar RRule
    "recurrenceRule" TEXT default null,
    -- If this is an instance of a recurring meeting (not the master),
    -- this is the event ID of the master.
    "recurrenceMasterEventID" INTEGER default null,
    -- If this is an instance of a recurring meeting (not the master),
    -- and this instance does not follow the normal pattern set by the master,
    -- but is changed in some way, e.g. exceptionally on a different day or time,
    -- then this is true. This means that the information in this event cannot
    -- be completely derived from the recurrence master and is therefore unique data.
    "recurrenceIsException" BOOLEAN default false,
    -- A string that changes when the event
    "changeStamp" TEXT default null,
    -- Original event file, as received over the wire.
    -- When modifying the event, after updating the fields in this DB table,
    -- read this source, modify *only* the changed or supported fields, and keep
    -- all unsupported fields as-is, then write back the file. This avoids that
    -- we delete unsupported fields in the original file format.
    "source" TEXT default null,
    -- Format of the "source"
    -- As MIME type, e.g. "text/calendar" for iCalendar as defined by RFC 9253
    "sourceMimetype" TEXT default null,
    FOREIGN KEY (calendarID)
      REFERENCES calendar (id)
      ON DELETE CASCADE
  );

  --- Who will attent the event, apart from (not including) our user
  CREATE TABLE "eventParticipant" (
    "eventID" INTEGER not null,
    "personID" INTEGER not null,
    -- 1 = accepted
    -- 2 = rejected
    -- 3 = tentative accepted
    -- null = not responded
    "confirmed" INTEGER default null,
    FOREIGN KEY (eventID)
      REFERENCES event (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_groupMember_eventID ON eventParticipant (eventID);
  CREATE INDEX index_groupMember_personID ON eventParticipant (personID);
`;
