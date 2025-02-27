import OWARequest from "../../../Mail/OWA/Request/OWARequest";
import type { OWAEvent } from "../OWAEvent";

export function owaGetEventsRequest(eventIDs: string[]): OWARequest {
  return new OWARequest("GetItemJsonRequest", {
    __type: "GetItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "Default",
      BodyType: "Best",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Body",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:ReminderIsSet",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:ReminderMinutesBeforeStart",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:LastModifiedTime",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:TextBody",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:IsAllDayEvent",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:EnhancedLocation",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:MyResponseType",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:RequiredAttendees",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:OptionalAttendees",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:Recurrence",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:ModifiedOccurrences",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:DeletedOccurrences",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:UID",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:RecurrenceId",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:IsOnlineMeeting",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "task:Recurrence",
      }],
    },
    ItemIds: eventIDs.map(id => ({
      __type: "ItemId:#Exchange",
      Id: id,
    })),
  });
}

export function owaGetCalendarEventsRequest(eventIDs: string[]): OWARequest {
  return new OWARequest("GetCalendarEventJsonRequest", {
    __type: "GetCalendarEventRequest:#Exchange",
    EventIds: eventIDs.map(id => ({
      __type: "ItemId:#Exchange",
      Id: id,
    })),
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
    },
  });
}

export function owaFindEventsRequest(folderID: string, maxFetchCount: number): OWARequest {
  return new OWARequest("FindItemJsonRequest", {
    __type: "FindItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
    },
    ParentFolderIds: [{
      __type: "DistinguishedFolderId:#Exchange",
      Id: folderID,
    }],
    Traversal: "Shallow",
    Paging: {
      __type: "IndexedPageView:#Exchange",
      BasePoint: "Beginning",
      Offset: 0,
      MaxEntriesReturned: maxFetchCount,
    },
  });
}

export function owaOnlineMeetingDescriptionRequest(eventIDs: string[]): OWARequest {
  return new OWARequest("GetItemJsonRequest", {
    __type: "GetItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Body",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:TextBody",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:EnhancedLocation",
      }, { // Might as well include this in case we don't have it yet
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:UID",
      }],
    },
    ItemIds: eventIDs.map(id => ({
      __type: "ItemId:#Exchange",
      Id: id,
    })),
  });
}

export function owaOnlineMeetingURLRequest(eventIDs: string[]): OWARequest {
  return new OWARequest("GetCalendarEventJsonRequest", {
    __type: "GetCalendarEventRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
    },
    EventIds: eventIDs.map(id => ({
      __type: "ItemId:#Exchange",
      Id: id,
    })),
  });
}

export function owaGetEventUIDsRequest(eventIDs: string[]): OWARequest {
  return new OWARequest("GetItemJsonRequest", {
    __type: "GetItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "calendar:UID",
      }],
    },
    ItemIds: eventIDs.map(id => ({
      __type: "ItemId:#Exchange",
      Id: id,
    })),
  });
}

export function owaCreateExclusionRequest(excludeEvent: OWAEvent, parentEvent: OWAEvent): OWARequest {
  return new OWARequest("DeleteItemJsonRequest", {
    __type: "DeleteItemRequest:#Exchange",
    ItemIds: [{
      __type: "OccurrenceItemId:#Exchange",
      RecurringMasterId: parentEvent.itemID,
      InstanceIndex: parentEvent.instances.indexOf(excludeEvent) + 1,
    }],
    DeleteType: "MoveToDeletedItems",
    SendMeetingCancellations: "SendToAllAndSaveCopy",
  });
}
