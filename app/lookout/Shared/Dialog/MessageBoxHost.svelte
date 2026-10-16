{#if $question}
  {#key $question}
    <Dialog title={$question.title} okLabel={$question.okLabel} cancelLabel={$question.cancelLabel}
      onOK={() => $question.answer(true)}
      on:close={() => $question?.answer(false)}>
      <span class="message">{$question.message}</span>
    </Dialog>
  {/key}
{/if}

<script lang="ts">
  import { MessageBox } from "./MessageBox";
  import Dialog from "./Dialog.svelte";

  const question = MessageBox.current;
</script>

<style>
  .message {
    padding-block: 4px 8px;
    line-height: 1.45;
  }
</style>
