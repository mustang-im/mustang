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
    <RoundButton label="Video call" icon={meet} iconSize="24px" filled />
  </hbox>
  <vbox flex />
  <hbox class="right">
    <Button label="Settings" icon={settings} iconSize="32px" plain iconOnly/>
  </hbox>
</hbox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import meet from '../asset/icon/appBar/meet.svg?raw';
  import settings from '../asset/icon/general/settings.svg?raw';
  import RoundButton from "../Shared/RoundButton.svelte";
  import Button from "../Shared/Button.svelte";

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
  .right {
    align-items: center;
    margin: 0 15px;
  }
</style>
