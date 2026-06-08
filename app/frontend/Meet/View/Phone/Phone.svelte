<vbox bind:clientWidth={width} flex>
  <Splitter hasRight={width > 600}>
    <hbox class="left" slot="left" flex>
      {#if showDialPad}
        <DialPad on:digit={ev => catchErrors(() => onSendSTMF(ev.detail))} />
      {/if}
    </hbox>
    <Scroll slot="right">
      {#if person}
        <ContactHistory {person} />
      {/if}
    </Scroll>
  </Splitter>
</vbox>

<script lang="ts">
  import type { MeetingParticipant } from "../../../../logic/Meet/Participant";
  import type { VideoConfMeeting } from "../../../../logic/Meet/VideoConfMeeting";
  import { PhoneCall } from "../../../../logic/Meet/PhoneCall";
  import ContactHistory from "../../../Contacts/History/ContactHistory.svelte";
  import Splitter from "../../../Shared/Splitter.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import DialPad from "./DialPad.svelte";
  import { catchErrors } from "../../../Util/error";
  import { assert } from "../../../../logic/util/util";

  export let otherParticipant: MeetingParticipant;
  export let meeting: VideoConfMeeting;

  let width: number;
  let showDialPad = true;
  $: person = otherParticipant?.findPerson();
  $: console.log("phone caller", otherParticipant);

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
