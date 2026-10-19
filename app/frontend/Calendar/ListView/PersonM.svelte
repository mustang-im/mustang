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

  export let person: Person;

  let events = appGlobal.calendarEvents.filterObservable(event => event.startTime.getTime() > Date.now());
  $: filteredEvents = person
    ? events.filterObservable(event => event.participants?.some(p => p.matchesPerson(person)))
    : events;
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
