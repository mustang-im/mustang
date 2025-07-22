<hbox class="persons font-normal">
  {#each $persons.each as person, i}
    {#if i < showNum || showAll}
      <slot name="person" {person} />
      {#if i < $persons.length - 1}
        <hbox class="separator">,</hbox>
      {/if}
    {/if}
  {/each}
  <hbox class="collapse buttons">
    {#if showAll}
      <Button
        icon={ChevronUpIcon}
        label={$t`Collapse`}
        onClick={() => showAll = false}
        classes="small collapse font-small"
        iconOnly
        />
    {:else if $persons?.length > showNum}
      <hbox class="more-bubble a b">
        <Button iconSize="10px"
          label="+ {plusNum}"
          tooltip={$t`Show ${plusNum} more`}
          classes="font-small"
          onClick={() => showAll = true}
          />
      </hbox>
    {/if}
  </hbox>
</hbox>

<script lang="ts">
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import Button from "../../Shared/Button.svelte";
  import ChevronUpIcon from "lucide-svelte/icons/chevron-up";
  import { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let persons: Collection<PersonUID>;

  const showNum = 3;
  let showAll = false;
  $: plusNum = $persons.length - showNum;
</script>

<style>
  .persons {
    flex-wrap: wrap;
    max-height: 70%;
  }
  .persons .separator {
    margin-inline-end: 0.3em;
    break-before: avoid;
  }
  .persons .buttons {
    margin-inline-start: 4px;
  }
  .persons .buttons :global(button.collapse) {
    border: none;
    padding: 0px 4px;
  }
  .more-bubble.a.b :global(button) {
    border: none;
    padding: 0px 8px;
  }
  .more-bubble :global(button:not(:hover)) {
    background-color: rgba(var(--shadow-color), 10%);
  }
</style>
