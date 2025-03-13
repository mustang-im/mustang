import OWARequest from "./OWARequest";

export default class OWASubscribeToNotificationRequest extends OWARequest {
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

  get type() {
    return "SubscribeToNotification";
  }

  constructor() {
    super("NotificationSubscribeJsonRequest");
  }
}
