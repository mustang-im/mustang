<vbox class="person-page" flex>
  <hbox class="header">
    {$t`Meetings with ${person?.name}`}
  </hbox>
  <ListView events={filteredEvents} />
</vbox>
<SearchBarM />

<script lang="ts">
  import { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import ListView from "./ListView.svelte";
  import SearchBarM from "./SearchBarM.svelte";
  import { t } from "../../../l10n/l10n";
  import { ArrayColl } from "svelte-collections";
  import { derived } from "svelte/store";

  export let person: Person;

  let calendarEvents = appGlobal.calendarEvents;
  $: events = derived([...$calendarEvents.contents], allEvents =>
    allEvents.filter(event => event.startTime.getTime() > Date.now()));
  $: filteredEvents = new ArrayColl(person
    ? $events.filter(event => event.participants?.some(p => p.matchesPerson(person)))
    : $events);
</script>

<style>
  .person-page {
    padding: 16px 16px 8px 16px;
  }
  .header {
    align-items: center;
    justify-content: center;
  }
</style>
