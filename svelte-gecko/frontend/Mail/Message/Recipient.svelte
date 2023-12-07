<value title={recipient.emailAddresses.first.value}>
  {recipient.name}
</value>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";

  export let recipient: Person;
</script>

<style>
</style>
