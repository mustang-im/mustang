<svelte:boundary>
	<slot />

	{#snippet failed(error, reset)}
    <vbox class="error-container" flex>
      <ErrorMessageInline ex={error instanceof Error ? error : new Error(error as string)} />
      <hbox class="error-buttons">
        <Button
          onClick={reset}
          label={$t`Try again`}
          />
      </hbox>
    </vbox>
	{/snippet}
</svelte:boundary>

<script lang="ts">
  import ErrorMessageInline from "./ErrorMessageInline.svelte";
  import Button from "./Button.svelte";
  import { t } from "../../l10n/l10n";
</script>

<style>
  .error-container {
    justify-content: center;
    align-items: center;
  }
  .error-buttons {
    align-self: end;
    margin-inline: 5%;
    margin-block-start: 24px;
  }
</style>
