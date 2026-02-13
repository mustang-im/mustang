<vbox class="dialog" flex>
  <hbox class="header">
    <hbox class="title">{$t`Debug log`}</hbox>
    <hbox flex />
    <hbox class="search">
      <input type="search" bind:value={searchInput} placeholder={$t`Search`} />
    </hbox>
  </hbox>
  <Scroll>
    <div class="log-history" bind:this={logHistoryEl}>
      {#each $filteredLog.each as log}
        <div class="line selectable value">
          <span class="time">{log.time.toISOString().substring(11, 23)}</span>
          <span class="message">{log.message()}</span>
        </div>
      {/each}
    </div>
  </Scroll>
  <hbox class="buttons">
    <Button
      label={$t`Copy to clipboard`}
      onClick={copyLogHistory}
    />
    <Button
      label={$t`Clear log history`}
      onClick={() => logHistory.clear()}
    />
  </hbox>
</vbox>

<script lang="ts">
  import { logHistory } from "../../../logic/util/logHistory";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { t } from "../../../l10n/l10n";

  let searchInput = "";
  $: searchTerm = searchInput.toLowerCase();
  $: filteredLog = logHistory.filterObservable(entry => entry.message().toLowerCase().includes(searchTerm));

  let logHistoryEl: HTMLDivElement;
  async function copyLogHistory() {
    navigator.clipboard.writeText(logHistoryEl.innerText + "\n");
  }
</script>

<style>
  .header {
    margin-block-end: 12px;
    padding-inline-end: 12px;
  }
  .title {
    font-size: 24px;
    font-weight: bold;
  }
  .line {
    white-space: pre-wrap;
  }
  .time {
    font-family: monospace;
    margin-inline-end: 8px;
  }
  .buttons {
    margin-block-start: 16px;
    gap: 8px;
  }
</style>
