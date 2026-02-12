<vbox flex>
  <h1>{$t`Debug log`}</h1>
  <Scroll>
    <div class="log-history" bind:this={logHistoryEl}>
      {#each $logHistory.each as log, i}
        <div class="line selectable">{i}. {log.time.toISOString().substring(11, 23)}: {log.message()}</div>
      {/each}
    </div>
  </Scroll>
  <hbox class="buttons">
    <Button
      label={$t`Copy to clipboard`}
      onClick={copyLogHistory}
    />
    <Button
      label={$t`Add test data`}
      onClick={() => logHistory.add(new ConsoleLogEntry(LogLevel.log, ["Test"]))}
    />
    <Button
      label={$t`Clear log history`}
      onClick={() => logHistory.clear()}
    />
  </hbox>
</vbox>

<script lang="ts">
  import { logHistory, ConsoleLogEntry, LogLevel } from "../../../logic/util/logHistory";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { t } from "../../../l10n/l10n";

  let logHistoryEl: HTMLDivElement;
  async function copyLogHistory() {
    navigator.clipboard.writeText(logHistoryEl.innerText + "\n");
  }
</script>

<style>
  .line {
    white-space: pre-wrap;
  }
  .buttons {
    margin-block-start: 16px;
    gap: 8px;
  }
</style>
