<AppObject obj={recipient}>
  <value title={recipient.emailAddresses.first.value}>
    {recipient.name}
  </value>
</AppObject>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import AppObject from "../../AppsBar/AppObject.svelte";

  export let recipient: Person;
  export let emailAddress: string;
</script>
