import sql from "../../../../lib/rs-sqlite/index";

export const meetDatabaseSchema = sql`
  CREATE TABLE "meetAccount" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "protocol" TEXT not null
  );

  -- Meetings, phone calls, and other voice/video calls that the user participated in.
  -- Only those that already and actually happened. Scheduled calls are calendar events.
  CREATE TABLE "call" (
    "id" INTEGER PRIMARY KEY,
    "accountID" INTEGER default null,
    "startTime" TEXT default null,
    "endTime" TEXT default null,
    -- 0 = incoming call, 1 = outgoing call
    "outgoing" BOOLEAN default false,
    -- The calendar event
    -- References "calendar.event.id". Optional.
    "eventID" INTEGER default null,
    -- The person that our user spoke with (the "contact").
    -- For meetings with multiple people, it's the organizer or
    -- (if our user is the organizer) the first participant.
    -- References "contacts.person.id". Optional.
    "contactID" INTEGER default null,
    -- Real name of the contact
    "contactName" TEXT default null,
    -- For phone calls, a "tel:" URL with the phone number of the contact.
    -- For meetings, the "calendar.event.onlineMeetingURL"
    "contactURL" TEXT default null,
    -- One of the email addresses of the contact.
    -- Mostly to help to find the contact in the address book later on.
    "contactEMailAddress" TEXT default null,
    -- Additional data
    "json" TEXT default null,
    FOREIGN KEY (accountID)
      REFERENCES meetAccount (id)
      ON DELETE CASCADE
  );
`;
