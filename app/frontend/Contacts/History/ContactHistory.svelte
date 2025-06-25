{#if $messages.hasItems}
  <vbox class="history" flex>
    <GroupBox>
      <hbox class="title" slot="header">
        {$t`Contact history`}
      </hbox>
      <vbox class="log" flex slot="content">
        <Scroll>
          {#each $messages.each as message}
            <LogBox {message} {person} />
          {/each}

          {#if $messages.length >= limit}
            <hbox class="show-more">
              <hbox class="count">
                {$t`Showing ${limit} results`}
              </hbox>
              <Button
                label={$t`Show more`}
                onClick={showMore}
                classes="secondary"
                icon={ShowMoreIcon}
                />
              </hbox>
          {/if}
        </Scroll>
      </vbox>
    </GroupBox>
  </vbox>
{/if}

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { searchLog } from "../../../logic/Contacts/History/History";
  import LogBox from "./LogBox.svelte";
  import GroupBox from "../GroupBox.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import Button from "../../Shared/Button.svelte";
  import ShowMoreIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  let limit = 200;
  $: messages = searchLog(person, limit);

  function showMore() {
    if (limit == 200) {
      limit = 1000;
    } else {
      limit += 1000;
    }
  }
</script>

<style>
  .history > :global(.group) {
    flex: 1 0 0;
  }
  .history > :global(.group > .content) {
    padding-right: 0px;
  }
  .show-more {
    align-items: center;
    justify-content: center;
    margin: 16px;
  }
  .count {
    margin-inline-end: 8px;
  }
</style>
