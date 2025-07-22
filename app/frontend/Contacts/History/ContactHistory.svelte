{#if $messages.hasItems}
  <vbox class="history" flex>
    <GroupBox>
      <hbox class="title" slot="header">
        {$t`Contact history *=> The log of previous interactions with this person`}
      </hbox>
      <vbox class="log" flex slot="content">
        <FastList items={messages} columns="12px 5em 48px 1fr">
          <LogBox {message} {person} let:item={message} slot="row"
            previousMessage={messages.getIndex(messages.indexOf(message) - 1)} />
        </FastList>

        {#if $messages.length >= limit}
          <hbox class="show-more">
            <hbox class="count">
              {$t`Showing ${limit} results`}
            </hbox>
            <Button
              label={$t`Show more`}
              onClick={showMore}
              icon={ShowMoreIcon}
              plain={true}
              />
            </hbox>
        {/if}
      </vbox>
    </GroupBox>
  </vbox>
{/if}

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { searchLog, type LogEntry } from "../../../logic/Contacts/History/History";
  import LogBox from "./LogBox.svelte";
  import GroupBox from "../GroupBox.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import Button from "../../Shared/Button.svelte";
  import ShowMoreIcon from "lucide-svelte/icons/chevron-down";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  const kDefaultLimit = 200;
  const kAddMore = 1000;
  let limit = kDefaultLimit;
  $: messages = searchLog(person, limit) as ArrayColl<LogEntry>;

  function showMore() {
    if (limit == kDefaultLimit) {
      limit = kAddMore;
    } else {
      limit += kAddMore;
    }
  }
</script>

<style>
  .history > :global(.group) {
    flex: 1 0 0;
  }
  .history > :global(.group > .content) {
    padding: 16px 0px 0px 0px;
  }
  .show-more {
    align-items: center;
    justify-content: center;
    margin: 2px 16px;
  }
  .count {
    margin-inline-end: 8px;
  }
</style>
