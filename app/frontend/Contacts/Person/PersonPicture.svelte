<vbox class="avatar" style="width: {size}px; height: {size}px;">
  {#if person?.picture}
    <img
      src={person.picture}
      width={size} height={size}
      title={$t`Picture of ${person.name}`}
      alt=""
      />
  {:else if allowPlaceholder}
    <hbox class="placeholder" />
  {/if}
</vbox>

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";
  import { t } from "../../../l10n/l10n";

  export let person: PersonOrGroup;
  export let size = 48;
  export let allowPlaceholder = false;
</script>

<style>
  .avatar {
    margin: 7px 12px;
    clip-path: circle();
  }
  .placeholder {
    width: 100%;
    height: 100%;
    border: 1px solid var(--border);
    border-radius: 1000px;
  }
</style>
