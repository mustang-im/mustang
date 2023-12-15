<hbox class="persons-toolbar">
  <input type="search" bind:value={searchText} placeholder="Add or search a participant" />
  <hbox class="buttons">
    <RoundButton
      label="New contact"
      on:click={addPerson}
      icon={NewContactIcon}
      iconSize="16px"
      />
    <RoundButton
      label="Copy invitation link"
      classes="invite-participant"
      on:click={() => catchErrors(inviteParticipant)}
      icon={InviteUserIcon}
      iconSize="16px"
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { OTalkConf } from "../../logic/Meet/OTalkConf";
  import { MeetingParticipant } from "../../logic/Meet/Participant";
  import { ParticipantVideo } from "../../logic/Meet/VideoStream";
  import { appGlobal } from "../../logic/app";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import InviteUserIcon from "lucide-svelte/icons/link";
  import { catchErrors } from "../Util/error";

  export let meeting: VideoConfMeeting;
  export let selected: MeetingParticipant;

  $: participants = meeting.participants;
  let searchText: string;

  function addPerson() {
    if (!searchText) {
      addTestParticipant();
      return;
    }
    // TODO Notify person
    let person = new MeetingParticipant();
    person.name = searchText;
    participants.add(person);
    selected = person;
  }

  async function inviteParticipant() {
    if (meeting instanceof OTalkConf) {
      let invitationURL = await meeting.getInvitationURL();
      navigator.clipboard.writeText(invitationURL);
      return;
    }
    throw new Error("I cannot invite to this kind of meeting");
  }

  function addTestParticipant() {
    // TODO remove test data
    let chatAccount = appGlobal.chatAccounts.first;
    let person = chatAccount.persons.at(Math.floor(chatAccount.persons.length) * Math.random());
    let participant = new MeetingParticipant();
    participant.name = person.name;
    participant.picture = person.picture;
    meeting.participants.add(participant);
    meeting.videos.add(new ParticipantVideo(new MediaStream(), participant));
  }
</script>

<style>
  .persons-toolbar {
    margin: 16px;
    align-items: center;
  }
  input[type="search"] {
    width: 100%;
    margin-right: 12px;
    height: 32px;
    padding: 0px 8px;
    border: 1px solid #BAB7BF;
    border-radius: 4px;
  }
  input::placeholder {
    color: #808080;
  }
  .buttons :global(button) {
    margin-right: 4px;
  }
</style>
