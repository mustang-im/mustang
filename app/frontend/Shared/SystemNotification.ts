import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { appGlobal } from "../../logic/app";
import logo from '../../asset/icon/general/logo.svg?raw';
import { backgroundError } from "../Util/error";

/** Tells the user about a new mail, a meeting reminder etc.
 * outside of our app window: a popup in the screen corner and in the
 * notification center of the OS. */
export class SystemNotification {
  kinds: NotificationKinds;
  title: string;
  body: string;
  /** Lets the OS replace an earlier popup of the same kind with this one,
   * instead of stacking them up. Only works for web popups. */
  id: string;
  /** Linux and Windows only.
   * Electron defaults to "low", where some desktops show the popup
   * only in the notification center, so we explicitly default to "normal". */
  urgency: "normal" | "critical" | "low" = "normal";
  /** How many mails etc. you want to notify about, at once with this notification.
   * TODO implement */
  count = 1;
  /** Raw SVG of the icon below the bubble
   * TODO implement?
   * TODO makes sense? */
  icon: string;
  /** The user clicked on the popup */
  onClick: (event: any) => void;
  /** The user typed an answer right into the popup. macOS only. */
  onReply: (text: string) => void;
  replyPlaceholder: string;

  constructor(kinds: NotificationKinds, title: string, body: string, id: string) {
    this.kinds = kinds;
    this.title = title;
    this.body = body;
    this.id = id;
  }

  /** Notifies the user in the `kinds` ways.
   * If one of them fails, the others are still shown. */
  async show() {
    await this.showPopups();

    if (this.kinds.taskbar) {
      try {
        // TODO
      } catch (ex) {
        backgroundError(ex);
      }
    }

    if (this.kinds.tray) {
      try {
        await appGlobal.remoteApp.newTrayIcon(bubbleImageURL(this.count, this.icon ?? logo));
      } catch (ex) {
        backgroundError(ex);
      }
    }

    if (this.kinds.sound) {
      try {
        await this.playNotificationSound();
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  async showPopups() {
    if (!this.kinds.popup) {
      return;
    }
    try {
      if (await appGlobal.remoteApp.isOSNotificationSupported()) {
        await this.showOSPopup();
      } else {
        await this.showWebPopup();
      }
    } catch (ex) {
      backgroundError(ex);
    }
  }

  /** Web API `Notification` */
  protected async showWebPopup() {
    if (typeof (Notification) == "undefined") { // e.g. Android WebView
      return;
    }
    if (Notification.permission != "granted" &&
        await Notification.requestPermission() != "granted") {
      return;
    }
    let popup = new Notification(this.title, {
      body: this.body,
      tag: this.id,
      renotify: true,
      // icon: url,
      // image: url,
    });
    if (this.onClick) {
      popup.onclick = event => this.onClick(event);
    }
    // shows automatically after creating the object
  }

  /** The popup of the OS, created by our backend process.
   * <https://www.electronjs.org/docs/latest/api/notification> */
  protected async showOSPopup() {
    let popup = await appGlobal.remoteApp.newOSNotification({
      title: this.title,
      body: this.body,
      // icon: url,
      urgency: this.urgency,
      hasReply: !!this.onReply,
      replyPlaceholder: this.replyPlaceholder,
      // Windows
      // toastXml: ...,
    });
    console.log("OS notification", popup);
    popup.show();

    if (this.onClick) {
      popup.on("click", event => this.onClick(event));
    }
    if (this.onReply) {
      popup.on("reply", async (event, replyText) => this.onReply(replyText));
    }
  }

  static lastSound = new Date();

  async playNotificationSound() {
    // Don't annoy user with successive "bing, bing, bing"
    // Don't bing at startup, implemented by default value of `lastSound`.
    const kMinTimeBetweenSounds = 2; // in seconds
    if (Date.now() - SystemNotification.lastSound.getTime() < kMinTimeBetweenSounds) {
      return;
    }
    SystemNotification.lastSound = new Date();

    let audioEl = new Audio("sound/new-message.mp3");
    await audioEl.play();
  }
}

/** In which ways the user wants to be notified about new mails, reminders etc.
 * @see NotificationKinds.svelte */
export class NotificationKinds {
  readonly popup: boolean;
  readonly sound: boolean;
  readonly taskbar: boolean;
  readonly tray: boolean;

  constructor(kinds: string[]) {
    sanitize.array(kinds);
    this.popup = kinds.includes("popup");
    this.sound = kinds.includes("sound");
    this.taskbar = kinds.includes("taskbar");
    this.tray = kinds.includes("tray");
  }
}

function bubbleImageURL(count: number, icon: string) {
  // TODO count
  return "data:image/svg;base64," + btoa(icon);
}

/* Missing in the DOM types of TypeScript */
declare global {
  interface NotificationOptions {
    /** Alert the user again, when this popup replaces an earlier one with the same `tag` */
    renotify?: boolean;
  }
}
