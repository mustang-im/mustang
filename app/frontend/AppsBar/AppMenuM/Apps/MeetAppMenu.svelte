{#if $selectedPerson}
  <CombinedButton
    icon1={meetMustangApp.icon}
    icon2={$selectedPerson.picture ?? PersonIcon}
    onClick={() => onCallPerson($selectedPerson)} />
{:else}
  <hbox class="empty" />
{/if}
<hbox class="empty" />
<AppButton app={meetMustangApp} page="/meet/" />
<CombinedButton icon1={meetMustangApp.icon} icon2={HistoryIcon} page="/meet/history" />
<CombinedButton icon1={meetMustangApp.icon} icon2={PlusIcon} onClick={onCreateMeeting} />

<script lang="ts">
  import { meetMustangApp } from "../../../Meet/MeetMustangApp";
  import { startAdHocMeeting, callSelected } from "../../../Meet/Start/start";
  import { goTo, openApp } from "../../selectedApp";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import HistoryIcon from "lucide-svelte/icons/history";
  import PersonIcon from "lucide-svelte/icons/user";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import { selectedPerson } from "../../../Contacts/Person/Selected";
  import { Person } from "../../../../logic/Abstract/Person";

  async function onCreateMeeting() {
    let meeting = await startAdHocMeeting();
    openApp(meetMustangApp, { meeting });
  }

  async function onCallPerson(person: Person) {
    let meeting = await callSelected(person);
    goTo("/meet/call", { meeting });
  }
</script>
