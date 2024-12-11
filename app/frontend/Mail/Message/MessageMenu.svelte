<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<Menu gutter={padding}>
  <Menu.Item
    on:click={() => catchErrors(() => reply())}
    title={$t`Reply to the person who sent this message`}
    icon={ReplyIcon}>
    {$t`Reply to author`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => replyAll())}
    title={$t`Reply to all recipients of this message`}
    icon={ReplyAllIcon}>
    {$t`Reply to all`}
  </Menu.Item>
  <Menu.Item
    on:click={event => catchErrors(() => forward(event))}
    title={$t`Send this message to somebody else`}
    icon={ForwardIcon}>
    {$t`Forward`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => redirect())}
    title={$t`Send this message to somebody else, who can reply to the original sender`}
    icon={RedirectIcon}>
    {$t`Redirect`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => deleteMessage())}
    color="red"
    icon={TrashIcon}>
    {$t`Delete`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => markAsSpam())}
    color="red"
    title={$t`Treat this email as spam: Move it to the Spam folder, and train the spam filter`}
    icon={SpamIcon}>
    {$t`Mark as spam`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => translate())}
    title={$t`Use an online translation service to translate this message to your default language.`}
    icon={TranslateIcon}>
    {$t`Translate`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => print())}
    title={$t`Put ink on dead trees which were artificially made white. Save the trees!`}
    icon={PrintIcon}>
    {$t`Print`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => showSource())}
    title={$t`Show the on-the-wire format of this message`}
    icon={SourceIcon}>
    {$t`Show source`}
  </Menu.Item>
</Menu>

<Print {message} bind:this={printE} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import Print from "./MessagePrint.svelte";
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
  import { t } from "../../../l10n/l10n";

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
  async function forward(event: MouseEvent) {
    let setting = getLocalStorage("mail.send.forward", "inline").value;
    let shift = !!event?.shiftKey;
    let forward: EMail;
    if (setting == "attachment" && !shift || setting == "inline" && shift) {
      forward = await message.action.forwardAsAttachment();
    } else {
      forward = await message.action.forwardInline();
    }
    mailMustangApp.writeMail(forward);
  }
  async function redirect() {
    let redirect = await message.action.redirect();
    mailMustangApp.writeMail(redirect);
  }

  async function deleteMessage() {
    await message.deleteMessage();
  }
  async function markAsSpam() {
    await message.treatSpam(true);
  }

  let printE: Print;
  async function print() {
    await printE.print();
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
