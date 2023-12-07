<hbox class="person">
  {#if person instanceof Person}
    <PersonPicture {person} />
  {/if}
  <vbox flex class="name-box">
    <hbox class="name">{person.name}</hbox>
  </vbox>
  <hbox class="actions">
    <RoundButton label="Video call" icon={VideoCallIcon} iconSize="24px" filled
      on:click={() => catchErrors(() => startVideoCall(person))} />
    <RoundButton label="Audio call" icon={VoiceCallIcon} iconSize="24px" filled
      on:click={() => catchErrors(() => startAudioCall(person))} />
  </hbox>
  <hbox flex />
</hbox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person } from "../../logic/Abstract/Person";
  import { startVideoCall, startAudioCall } from "../../logic/Meet/StartCall";
  import { catchErrors } from "../Util/error";
  import PersonPicture from "../Shared/Person/PersonPicture.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import VideoCallIcon from '../asset/icon/appBar/meet.svg?raw';
  import VoiceCallIcon from '../asset/icon/meet/callVoice.svg?raw';

  export let person: Contact;
</script>

<style>
  .name-box {
    font-weight: bold;
    margin: 15px;
  }
  .actions {
    align-items: center;
  }
  .actions :global(button) {
    margin-right: 8px;
  }
</style>
