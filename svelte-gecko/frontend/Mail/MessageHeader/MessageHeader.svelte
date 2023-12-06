<vbox class="message-header" class:outgoing={message.outgoing}>
  <value class="subject">{message.subject}</value>
  <hbox>
    {#if message.contact instanceof Person}
      <PersonPicture person={message.contact} />
    {/if}
    <vbox>
      <value class="from" title={message.authorEmailAddress}>
        {from}
      </value>
      <hbox class="to">
        to&nbsp;
        <value title={message.recipientEmailAddress}>
          {to}
        </value>
      </hbox>
    </vbox>
    <hbox flex />
    <vbox>
      <hbox class="buttons">
        <hbox class="star" class:starred={message.starred}>
          <Button
            icon={StarIcon}
            iconSize="24px"
            iconOnly
            label="Remember this message"
            on:click={toggleStar}
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
      <value class="date" title={message.received?.toLocaleString()}>
        {getDateString(message.received)}
      </value>
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  //import type { Email } from "mustang-lib";
  import type { EMail } from "../../../logic/Mail/Message";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import { Person } from "../../../logic/Abstract/Person";
  import PersonPicture from "../../Shared/PersonPicture.svelte";
  import Button from "../../Shared/Button.svelte";
  import { getDateString } from "../../Util/date";
  import StarIcon from "lucide-svelte/icons/star";
  import MoreIcon from "lucide-svelte/icons/more-horizontal";

  export let message: EMail;
  export let account: MailAccount;

  $: from = message.outgoing
    ? "me"
    : message.contact?.name
      ?? message.authorEmailAddress;
  $: to = message.outgoing
    ? message.contact?.name
      ?? message.recipientEmailAddress
    : "me";

  function toggleStar() {
    message.starred = !message.starred;
  }
</script>

<style>
  .message-header {
    min-height: 5em;
    padding: 16px 20px 8px 20px;
    background-color: #F9F9FD;
  }
  .subject {
    font-weight: 700;
    margin-bottom: 8px;
  }
  .from {
    font-weight: bold;
  }
  .outgoing .from {
    color: grey;
  }
  .to {
    font-size: 13px;
    color: grey;
  }
  .outgoing .to {
    font-weight: bold;
    color: inherit;
  }
  .buttons {
    justify-content: end;
    margin-bottom: 8px;
  }
  .buttons > * {
    margin-left: 8px;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
</style>
