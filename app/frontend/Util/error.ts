import { notifications, Notification, NotificationSeverity } from "../MainWindow/Notification";
import { production } from "../../logic/build";
import * as Sentry from "@sentry/svelte";

export function showError(ex: Error) {
  console.error(ex);
  if (shouldShow(ex)) {
    notifications.add(new Notification(ex.message, NotificationSeverity.Error, ex));
    logErrorToServer(ex);
  }
}

export function backgroundError(ex: Error) {
  console.error(ex);
  if (production) {
    return;
  }
  if (shouldShow(ex)) {
    notifications.add(new Notification(ex.message, NotificationSeverity.Warning, ex));
    logErrorToServer(ex);
  }
}

export function showUserError(ex: Error, autoDisappearAfterSeconds?: number): { remove(): void } {
  let notification = new Notification(ex.message, NotificationSeverity.Error, ex);
  notifications.add(notification);
  if (autoDisappearAfterSeconds) {
    setTimeout(() => {
      notifications.remove(notification);
    }, autoDisappearAfterSeconds * 1000);
  }
  return {
    remove() {
      notifications.remove(notification);
    }
  };
}

function shouldShow(ex: Error): boolean {
  return ex?.message &&
    !(ex as any).doNotShow &&
    !notifications.find(noti => noti.message == ex.message); // don't repeat
}

export function logError(ex: Error) {
  console.error(ex);
  logErrorToServer(ex);
}

function logErrorToServer(ex: Error) {
  try {
    if ((ex as any)?.isUserError || (ex as any)?.doNotLog) {
      return;
    }
    if (production) {
      Sentry.captureException(ex);
    }
  } catch (ex) {
    console.error(ex);
  }
}

export async function catchErrors(func: Function, errorFunc = showError) {
  try {
    await func();
  } catch (ex) {
    errorFunc(ex);
  }
}

/** In case of errors/exceptions, return a fallback value */
export function catchFallback<T>(func: () => T, fallbackResult: T): T {
  try {
    return func();
  } catch (ex) {
    return fallbackResult;
  }
}
