<hbox class="left" />
<LogTime {message} />
<LogIconByType {message} />
<vbox class="content">
  <LogContentByType {message} />
</vbox>

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import type { Person } from "../../../logic/Abstract/Person";
  import LogTime from "./LogTime.svelte";
  import LogIconByType from "./LogIconByType.svelte";
  import LogContentByType from "./LogContentByType.svelte";

  export let message: LogEntry;
  export let person: Person;
</script>

<style>
  .content {
    padding: 4px 12px;
  }
  .left {
    padding-inline-start: 12px;
  }
</style>
