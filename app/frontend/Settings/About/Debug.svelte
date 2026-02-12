<vbox class="dialog" flex>
  <h1>{$t`Debug log`}</h1>
  <Scroll>
    <div class="log-history" bind:this={logHistoryEl}>
      {#each $logHistory.each as log}
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

  let logHistoryEl: HTMLDivElement;
  async function copyLogHistory() {
    navigator.clipboard.writeText(logHistoryEl.innerText + "\n");
  }
</script>

<style>
  .dialog {
    margin-block-start: -32px;
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
