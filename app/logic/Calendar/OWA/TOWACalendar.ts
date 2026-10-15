/** From `GetCalendarFolders`, in `CalendarGroups[].Calendars[]` */
export interface TOWACalendarEntry {
  OwnerEmailAddress?: string;
  IsOwnerEmailAddressInvalid?: boolean;
  SharedFolderId?: {
    Id: string;
  };
}
