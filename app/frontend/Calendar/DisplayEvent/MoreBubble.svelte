<hbox class="more-bubble a b">
  <Button {onClick} iconSize="10px"
    label="+ {plusNum}"
    tooltip={$t`Show ${plusNum} more`}
    classes="font-small"
    />
</hbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  export let plusNum: number;
  export let onClick: () => void;
</script>

<style>
  .more-bubble.a.b :global(button) {
    border: none;
    padding: 0px 8px;
  }
  .more-bubble :global(button:not(:hover)) {
    background-color: rgba(var(--shadow-color), 10%);
  }
</style>
