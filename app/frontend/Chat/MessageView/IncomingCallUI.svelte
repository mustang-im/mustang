<script>
  import { IncomingCall } from "../../../logic/Chat/RoomEvent";
  import RoundButton from "../../Shared/RoundButton.svelte";
import { catchErrors } from "../../Util/error";

</script>
<MessageUI {message} {previousMessage}>
  <hbox slot="bubble" class="bubblr">
    <RoundButton
      label="Answer"
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
