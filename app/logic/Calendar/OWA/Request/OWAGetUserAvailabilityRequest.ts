export class OWAGetUserAvailabilityRequest {
  /** Free/Busy requests are wrapped in an additional object for some reason. */
  readonly request: any = {
    __type: "GetUserAvailabilityInternalJsonRequest:#Exchange",
    Header: {
      __type: "JsonRequestHeaders:#Exchange",
      RequestServerVersion: "Exchange2013",
      TimeZoneContext: {
        __type: "TimeZoneContext:#Exchange",
        TimeZoneDefinition: {
          __type: "TimeZoneDefinitionType:#Exchange",
          Id: "UTC",
        },
      },
    },
    Body: {
      __type: "GetUserAvailabilityRequest:#Exchange",
      FreeBusyViewOptions: {
        __type: "FreeBusyViewOptions:#Exchange",
        TimeWindow: {
          __type: "Duration:#Exchange",
        },
        RequestedView: "FreeBusy",
      },
    },
  };

  /** @param windowsTimezone The time zone of the work hours in the response */
  constructor(emailAddresses: string[], from: Date, to: Date, windowsTimezone = "UTC") {
    this.request.Header.TimeZoneContext.TimeZoneDefinition.Id = windowsTimezone;
    this.request.Body.MailboxDataArray = emailAddresses.map(emailAddress => ({
      __type: "MailboxData:#Exchange",
      Email: {
        __type: "EmailAddress:#Exchange",
        Address: emailAddress,
      },
    }));
    this.request.Body.FreeBusyViewOptions.TimeWindow.StartTime = from.toISOString();
    this.request.Body.FreeBusyViewOptions.TimeWindow.EndTime = to.toISOString();
  }

  get action() {
    return "GetUserAvailabilityInternal";
  }
}
