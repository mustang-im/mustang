<hbox class="person">
  {#if person instanceof Person}
    <PersonPicture {person} />
  {/if}
  <vbox flex class="name-box">
    <hbox class="name">{$person.name}</hbox>
  </vbox>
  <hbox class="actions">
    <RoundButton label={$t`Video call`} icon={VideoCallIcon} classes="secondary large"
      onClick={() => startVideoCall(person)} />
    <RoundButton label={$t`Audio call`} icon={VoiceCallIcon} classes="secondary large"
      onClick={() => startAudioCall(person)} />
  </hbox>
  <hbox flex />
</hbox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person } from "../../logic/Abstract/Person";
  import { startVideoCall, startAudioCall } from "../../logic/Meet/StartCall";
  import PersonPicture from "../Shared/Person/PersonPicture.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import VideoCallIcon from '../asset/icon/appBar/meet.svg?raw';
  import VoiceCallIcon from '../asset/icon/meet/callVoice.svg?raw';
  import { t } from "../../l10n/l10n";

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
    margin-inline-end: 8px;
  }
</style>
