/** An item in the folder "Common Views", from `FindItem`, after `XML2JSON()` */
export interface TEWSCalendarShortcutItem {
  ItemClass?: string;
  ExtendedProperty?: TEWSExtendedProperty | TEWSExtendedProperty[];
}

export interface TEWSExtendedProperty {
  ExtendedFieldURI: {
    PropertyTag: string;
    PropertyType: string;
  };
  Value: string;
}
