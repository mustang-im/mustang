<hbox class="person">
  <vbox class="image">
    <img
      src={person.picture}
      width="64" height="64"
      title="Picture of {person.name}"
      alt="Picture of {person.name}" />
  </vbox>
  <vbox class="name-box">
    <hbox flex class="name">{person.name}</hbox>
  </vbox>
  <hbox class="actions">
    <Icon data={videoCall} size="32px" />
  </hbox>
  <vbox flex />
  <hbox class="right">
    <Icon data={settings} size="32px" />
  </hbox>
</hbox>

<script lang="ts">
  import type { ChatPerson } from "../../logic/Chat/Person";
  import Icon from 'svelte-icon/Icon.svelte';
  import videoCall from '../asset/icon/meet/videoCall.svg?raw';
  import settings from '../asset/icon/general/settings.svg?raw';

  export let person: ChatPerson;
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
