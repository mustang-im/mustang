<DisplayList {options} {duration} {showEndTime}>
  <hbox class="buttons" slot="right" let:option>
    <Button
      label={$t`Remove time option`}
      icon={RemoveIcon}
      iconOnly
      onClick={() => options.remove(option)}
      classes="remove"
      plain
      />
  </hbox>
</DisplayList>

<!--<AddManual {options} {durationInMinutes} />-->

<script lang="ts">
  import DisplayList from "./DisplayList.svelte";
  import Button from "../../../Shared/Button.svelte";
  import RemoveIcon from "lucide-svelte/icons/x";
  import { t } from "../../../../l10n/l10n";
  import { Collection } from "svelte-collections";

  export let options: Collection<Date>;
  /** in minutes */
  export let duration: number;
  export let showEndTime = true;
</script>

<style>
</style>
