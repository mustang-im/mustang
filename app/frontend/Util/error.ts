import { notifications, Notification, NotificationSeverity } from "../MainWindow/Notification";

export function showError(ex) {
  console.error(ex);
  if (!ex.isUserError &&
      !notifications.find(noti => noti.message == ex.message)) { // don't repeat
    notifications.add(new Notification(ex.message, NotificationSeverity.Error, ex));
  }
}

export function backgroundError(ex) {
  console.error(ex);
  if (!ex.isUserError &&
      !notifications.find(noti => noti.message == ex.message)) { // don't repeat
    notifications.add(new Notification(ex.message, NotificationSeverity.Warning, ex));
  }
}

export async function catchErrors(func: Function, errorFunc = showError) {
  try {
    await func();
  } catch (ex) {
    errorFunc(ex);
  }
}
