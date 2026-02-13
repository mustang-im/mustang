<MessageUI {message} {previousMessage}>
  <hbox slot="bubble" class="bubblr">
    <RoundButton
      label={$t`Answer`}
      icon={AnswerCallIcon}
      onClick={answerCall}
      classes="answer"
      filled
      />
  </hbox>
</MessageUI>

<script lang="ts">
  import type { Message } from "../../../logic/Abstract/Message";
  import MessageUI from "./Message.svelte";
  import AnswerCallIcon from "lucide-svelte/icons/phone-call";
  import { IncomingCall } from "../../../logic/Chat/RoomEvent";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import { t } from "../../../l10n/l10n";

  export let message: IncomingCall;
  export let previousMessage: Message = null;

  async function answerCall() {
    await message.conf.answer();
  }
</script>

<style>
  .bubble :global(.answer) {
    background-color: lightgreen;
  }
</style>
