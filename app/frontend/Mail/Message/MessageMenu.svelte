<Menu gutter={padding}>
  <Menu.Item
    on:click={() => catchErrors(() => reply())}
    title="Reply to the person who sent this message"
    icon={ReplyIcon}>
    Reply to author
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => replyAll())}
    title="Reply to all recipients of this message"
    icon={ReplyAllIcon}>
    Reply to all
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => forward())}
    title="Send this message to somebody else"
    icon={ForwardIcon}>
    Forward
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => redirect())}
    title="Send this message to somebody else, who can reply to the original sender"
    icon={RedirectIcon}>
    Redirect
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => deleteMessage())}
    color="red"
    icon={TrashIcon}>
    Delete
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => markAsSpam())}
    color="red"
    title="Delete the message, and train the spam filter"
    icon={SpamIcon}>
    Mark as spam
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => translate())}
    title="Use an online translation service to translate this message to your default language."
    icon={TranslateIcon}>
    Translate
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => print())}
    title="Put ink on dead trees which were artificially made white. Save the trees!"
    icon={PrintIcon}>
    Print
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => showSource())}
    title="Show the on-the-wire format of this message"
    icon={SourceIcon}>
    Show source
  </Menu.Item>
</Menu>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import { Menu } from "@svelteuidev/core";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import RedirectIcon from "lucide-svelte/icons/move-right";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import TranslateIcon from "lucide-svelte/icons/languages";
  import PrintIcon from "lucide-svelte/icons/printer";
  import SourceIcon from "lucide-svelte/icons/code-xml";
  import { catchErrors } from "../../Util/error";
  import { NotImplemented } from "../../../logic/util/util";
  import { getLocalStorage } from "../../Util/LocalStorage";

  export let message: EMail;
  export let padding = 5;

  function reply() {
    let reply = message.action.replyToAuthor();
    mailMustangApp.writeMail(reply);
  }
  function replyAll() {
    let reply = message.action.replyAll();
    mailMustangApp.writeMail(reply);
  }
  function forward() {
    let forward = message.action.forward();
    mailMustangApp.writeMail(forward);
  }
  function redirect() {
    let redirect = message.action.redirect();
    mailMustangApp.writeMail(redirect);
  }

  async function deleteMessage() {
    await message.deleteMessage();
  }
  async function markAsSpam() {
    await message.treatSpam(true);
  }

  function print() {
    throw new NotImplemented();
  }
  function showSource() {
    let setting = getLocalStorage("mail.contentRendering", "html");
    setting.value = setting.value == "source" ? "html" : "source";
  }
  function translate() {
    throw new NotImplemented();
  }
</script>

<style>
</style>
