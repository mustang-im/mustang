{#if $messages.hasItems}
  <vbox class="history" flex>
    <GroupBox>
      <hbox class="title" slot="header">
        {$t`Contact history`}
      </hbox>
      <vbox class="log" flex slot="content">
        <FastList items={messages} columns="12px 48px 48px 1fr">
          <LogBox {message} {person} let:item={message} slot="row" />
        </FastList>

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
      </vbox>
    </GroupBox>
  </vbox>
{/if}

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { searchLog } from "../../../logic/Contacts/History/History";
  import LogBox from "./LogBox.svelte";
  import GroupBox from "../GroupBox.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import Button from "../../Shared/Button.svelte";
  import ShowMoreIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  const kDefaultLimit = 200;
  const kAddMore = 1000;
  let limit = kDefaultLimit;
  $: messages = searchLog(person, limit);

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
    padding: 16px 0px;
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
