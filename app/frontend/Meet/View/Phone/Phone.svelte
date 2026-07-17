<vbox bind:clientWidth={width} flex>
  <Splitter
    hasRight={person && width > 600}
    initialRightRatio={0.4}
    name="phone-contact-history-during-call">
    <hbox class="left" slot="left" flex>
      {#if $showDialPad}
        <DialPad on:digit={ev => catchErrors(() => onSendSTMF(ev.detail))} />
      {/if}
    </hbox>
    <Scroll slot="right">
      <vbox class="contact-history" flex>
        <ContactHistory {person} colorInherit={true} />
      </vbox>
    </Scroll>
  </Splitter>
</vbox>

<script lang="ts">
  import type { MeetingParticipant } from "../../../../logic/Meet/Participant";
  import type { VideoConfMeeting } from "../../../../logic/Meet/VideoConfMeeting";
  import { PhoneCall } from "../../../../logic/Meet/PhoneCall";
  import { showDialPad } from "../../uiState";
  import ContactHistory from "../../../Contacts/History/ContactHistory.svelte";
  import Splitter from "../../../Shared/Splitter.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import DialPad from "./DialPad.svelte";
  import { catchErrors } from "../../../Util/error";
  import { assert } from "../../../../logic/util/util";

  export let showParticipant: MeetingParticipant;
  export let meeting: VideoConfMeeting;

  let width: number;
  $: participants = $meeting.participants;
  $: remote = showParticipant ?? $participants.first
  $: person = remote?.findPerson();

  async function onSendSTMF(digit: string) {
    assert(meeting instanceof PhoneCall, "Not a phone call");
    await meeting.sendDTMF(digit);
  }
</script>

<style>
  .left {
    align-items: center;
    justify-content: center;
    padding: 32px;
  }
</style>
