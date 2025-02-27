export default class OWASubscribeToNotificationRequest {
  /** This request is a special snowflake. Not only did they copy the Persona
   * approach of wrapping the request in an object, they then put their data
   * in a separate property of that object rather than in the request. */
  readonly request = {
    __type: "NotificationSubscriptionJsonRequest:#Exchange",
    Header: {
      __type: "JsonRequestHeaders:#Exchange",
      RequestServerVersion: "Exchange2013",
    },
  };
  readonly subscriptionData = [{
    __type: "SubscriptionData:#Exchange",
    SubscriptionId: "HierarchyNotification",
    Parameters: {
      __type: "SubscriptionParameters:#Exchange",
      NotificationType: "HierarchyNotification",
    },
  }, {
    __type: "SubscriptionData:#Exchange",
    SubscriptionId: "NewMailNotification",
    Parameters: {
      __type: "SubscriptionParameters:#Exchange",
      NotificationType: "NewMailNotification",
    },
  }];

  get action() {
    return "SubscribeToNotification";
  }
}
