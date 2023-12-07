<hbox class="buttons">
  <hbox class="reply">
    <Button
      icon={ReplyIcon}
      iconSize="24px"
      iconOnly
      label={"Reply to author only"}
      on:click={() => catchErrors(() => reply())}
      plain
      />
  </hbox>
  <hbox class="reply-all">
    <Button
      icon={ReplyAllIcon}
      iconSize="24px"
      iconOnly
      label={"Reply to all"}
      on:click={() => catchErrors(() => replyAll())}
      plain
      />
  </hbox>
  <hbox class="unread" class:read={message.read}>
    <Button
      icon={CircleIcon}
      iconSize="16px"
      iconOnly
      label={message.read ? "Mark this message as unread" : "Mark this message as read"}
      on:click={() => catchErrors(() => toggleRead())}
      plain
      />
  </hbox>
  <hbox class="star" class:starred={message.starred}>
    <Button
      icon={StarIcon}
      iconSize="20px"
      iconOnly
      label="Remember this message"
      on:click={() => catchErrors(() => toggleStar())}
      plain
      />
  </hbox>
  <hbox>
    <Button
      icon={MoreIcon}
      iconSize="24px"
      iconOnly
      label="Additional commands for this message"
      plain
      />
  </hbox>
</hbox>

<script lang="ts">
  //import type { Email } from "mustang-lib";
  import type { EMail } from "../../../logic/Mail/Message";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import MoreIcon from "lucide-svelte/icons/more-horizontal";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;
  export let account: MailAccount;

  function toggleRead() {
    message.read = !message.read;
  }
  function toggleStar() {
    message.starred = !message.starred;
  }
  function reply() {
  }
  function replyAll() {
  }
</script>

<style>
  .buttons {
    justify-content: end;
    margin-bottom: 8px;
  }
  .buttons > * {
    margin-left: 8px;
  }
  .buttons :global(svg) {
    stroke-width: 1.5px;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
</style>
