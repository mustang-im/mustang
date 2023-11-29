<hbox class="person">
  <vbox class="image">
    <img
      src={person.picture}
      width="64" height="64"
      title="Picture of {person.name}"
      alt="" />
  </vbox>
  <vbox class="name-box">
    <hbox flex class="name">{person.name}</hbox>
  </vbox>
  <hbox class="actions">
    <RoundButton label="Video call" icon={VideoCallIcon} iconSize="24px" filled />
    <RoundButton label="Audio call" icon={VoiceCallIcon} iconSize="24px" filled />
  </hbox>
</hbox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import RoundButton from "../Shared/RoundButton.svelte";
  import VideoCallIcon from '../asset/icon/appBar/meet.svg?raw';
  import VoiceCallIcon from '../asset/icon/meet/callVoice.svg?raw';

  export let person: Contact;
</script>

<style>
  .image {
    width: 56px;
    height: 56px;
    margin: 7px 12px;
    clip-path: circle();
  }
  .name-box {
    font-weight: bold;
    margin: 15px;
    margin-right: 64px;
  }
  .actions {
    align-items: center;
  }
  .actions :global(button) {
    margin-right: 8px;
  }
  .right {
    align-items: center;
    margin: 0 15px;
  }
</style>
