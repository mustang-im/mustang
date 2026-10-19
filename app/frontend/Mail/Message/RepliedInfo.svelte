{#if $message.isReplied}
  <hbox class="replied font-small" class:found={!!reply}
    title={reply || isSearching ? null : $t`Your reply was not found in your folders`}>
    {#if reply}
      <Button plain
        icon={RepliedIcon} iconSize="14px"
        label={reply.sent
          ? $t`You replied to this message on ${reply.sent.toLocaleString(getDateTimeLocale(), { dateStyle: "medium", timeStyle: "short" })}`
          : $t`You replied to this message`}
        tooltip={$t`Open your reply`}
        onClick={onOpenReply} />
    {:else}
      <RepliedIcon size="14px" />
      <hbox>{$t`You replied to this message`}</hbox>
    {/if}
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { openEMailMessage } from "../open";
  import Button from "../../Shared/Button.svelte";
  import RepliedIcon from "lucide-svelte/icons/reply";
  import { catchErrors, backgroundError } from "../../Util/error";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let message: EMail;

  let reply: EMail | null = null;
  let isSearching = false;
  $: isReplied = $message.isReplied;
  $: catchErrors(() => findReply(message, isReplied), backgroundError);
  async function findReply(original: EMail, isReplied: boolean) {
    reply = null;
    if (!isReplied) {
      return;
    }
    isSearching = true;
    try {
      let found = await original.findMyReply();
      if (original == message) {
        reply = found;
      }
    } finally {
      if (original == message) {
        isSearching = false;
      }
    }
  }

  async function onOpenReply() {
    await openEMailMessage(reply);
  }
</script>

<style>
  .replied {
    align-items: center;
    gap: 4px;
    min-height: 24px;
    color: grey;
  }
  .replied:not(.found) {
    padding-inline: 8px;
  }
  .replied :global(button) {
    padding: 2px 8px;
    color: inherit;
    font-size: inherit;
  }
</style>
