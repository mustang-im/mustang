<hbox class="persons-toolbar">
  <input type="search" bind:value={searchText} placeholder={$t`Add or search a participant`} />
  <hbox class="buttons">
    <RoundButton
      label={$t`New contact`}
      onClick={addPerson}
      icon={NewContactIcon}
      iconSize="16px"
      />
    <RoundButton
      label={$t`Copy invitation link`}
      classes="invite-participant"
      onClick={inviteParticipant}
      disabled={!meeting.account.canCreateURL}
      icon={InviteUserIcon}
      iconSize="16px"
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { M3Conf } from "../../logic/Meet/M3/M3Conf";
  import { MeetingParticipant } from "../../logic/Meet/Participant";
  import { ParticipantVideo } from "../../logic/Meet/VideoStream";
  import { appGlobal } from "../../logic/app";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import InviteUserIcon from "lucide-svelte/icons/link";
  import { assert } from "../../logic/util/util";
  import { gt, t } from "../../l10n/l10n";

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
    assert(meeting.account.canCreateURL, gt`I cannot invite using a link to this kind of meeting`);
    let invitationURL = await meeting.createInvitationURL();
    navigator.clipboard.writeText(invitationURL);
  }

  function addTestParticipant() {
    // TODO remove test data
    let chatAccount = appGlobal.chatAccounts.first;
    assert(chatAccount.persons.hasItems, $t`No persons in this chat account`);
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
    margin-inline-end: 12px;
    height: 32px;
    padding: 0px 16px;
    border: 1px solid #8D8995;
    border-radius: 16px;
    background-color: #5C5768;
    color: white;
  }
  input::placeholder {
    color: white;
  }
  .buttons :global(button) {
    margin-inline-end: 4px;
  }
  .buttons :global(button.invite-participant) {
    background-color: transparent;
    color: white;
  }
</style>
