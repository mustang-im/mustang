<vbox class="avatar" style="width: {size}px; height: {size}px;">
  <!-- TODO -->
  {#if person?.picture}
    <img
      src={person.picture}
      width={size} height={size}
      title={$t`Picture of ${person.name}`}
      alt=""
      />
  {/if}
</vbox>

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let persons: Collection<PersonOrGroup>;
  export let size = 48;

  $: person = persons.first;
</script>

<style>
  .avatar {
    margin: 7px 12px;
    clip-path: circle();
  }
</style>
