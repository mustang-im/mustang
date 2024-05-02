<audio src="/sound/ringtone1.mp3" bind:this={audioEl} />

<script lang="ts">
  import type { EMail } from "../../logic/Mail/EMail";
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import { appGlobal } from "../../logic/app";
  import { sleep } from "../../logic/util/util";
  import { backgroundError, catchErrors, showError } from "../Util/error";
  import { CollectionObserver, type Collection } from "svelte-collections";

  $: emailAccounts = appGlobal.emailAccounts;
  $: catchErrors(() => newMailListener($emailAccounts));
  async function newMailListener(emailAccounts: Collection<MailAccount>) {
    await sleep(10);
    let observer = new NewMessageObserver();
    for (let acc of emailAccounts) {
      console.log("observe account", acc.name, acc?.inbox?.messages.length);
      acc.inbox?.messages.registerObserver(observer);
      // TODO unregister previous observers:
      // let currentObservers = new Map<MailAccount, NewMessageObserver>();
    }
  }

  let audioEl: HTMLAudioElement;

  const doSound = true;
  const doOSNotification = false;
  const doWebNotification = true;
  let isOSNotificationSupported: boolean = undefined;

  async function showNewMail(messages: EMail[]) {
    console.log("Show new mail", messages.length);
    if (!messages?.length) {
      return;
    }
    let message = messages.length == 1 ? messages[0] : null;
    messages = messages.slice(0, 5);
    // TODO prioritize messages based on relation of user to sender
    let title = message?.subject ??
      messages.map(msg => msg.subject?.substring(0, 20) ?? "")
          .join(", ").substring(0, 60);
    let body = message?.text ?? messages.map(msg => msg.text?.substring(0, 30))
      .join(", ").substring(0, 160);

    if (doOSNotification && isOSNotificationSupported === undefined) {
      isOSNotificationSupported = await appGlobal.remoteApp.isOSNotificationSupported();
    }

    if (doSound) {
      try {
        audioEl.play();
      } catch (ex) {
        backgroundError(ex);
      }
    }
    if (doWebNotification) {
      try {
        let notification = new Notification(title, {
          body,
          tag: "New Mail",
          renotify: true,
          // icon: url,
          // image: url,
          data: message ?? messages[0],
        });
        // shows automatically after creating the object
      } catch (ex) {
        backgroundError(ex);
      }
    }
    if (doOSNotification && isOSNotificationSupported) {
      try {
        let notification = await appGlobal.remoteApp.newOSNotification({
          title,
          body,
          // icon: url,
          // Mac OS only
          urgency: "low",
          hasReply: true,
          replyPlaceholder: "Reply...",
          // Windows
          // toastXml: ...,
        });
        console.log("notification", notification);
        notification.show();

        let msg = message ?? messages[0];
        notification.on("click", event => {
          alert("open message\n" + msg.subject); // TODO
        });
        notification.on("reply", async (event, replyText) => {
          try {
            console.log("Reply with:\n" + replyText + "\nto msg\n" + msg.subject);
            let replyMsg = msg.replyToAuthor();
            replyMsg.html = null;
            replyMsg.text = replyText;
            await replyMsg.send();
          } catch (ex) {
            showError(ex);
          }
        });
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  class NewMessageObserver extends CollectionObserver<EMail> {
    added(messages: EMail[]) {
      showNewMail(messages);
    }
    removed(messages: EMail[]) {
      // do nothing
    }
  }
</script>
