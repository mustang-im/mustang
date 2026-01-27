<hbox class="buttons">
  <Button
    label={$t`Confirm`}
    icon={AcceptIcon}
    onClick={() => onSelect(time)}
    classes="accept"
    disabled={isOrganizer}
    plain
    />
</hbox>

<script lang="ts">
  import { type TSMLBookMe, TSMLBookMeState, type TSMLAction } from "../../../../logic/Mail/SML/TSML";
  import Button from "../../../Shared/Button.svelte";
  import AcceptIcon from "lucide-svelte/icons/check";
  import { t } from "../../../../l10n/l10n";

  export let bookMe: TSMLBookMe;
  export let myReaction: TSMLAction;
  export let time: Date;
  export let selectedTime: Date;
  export let isOrganizer = false;

  function onSelect(time: Date) {
    selectedTime = time;
    bookMe.state = TSMLBookMeState.UserConfirm;
    myReaction.state = bookMe.state; // TODO
    myReaction.object = time; // TODO
  }
</script>

<style>
  .buttons :global(button.accept svg) {
    stroke-width: 3px;
  }
  .buttons :global(button.accept:not(.selected) .icon) {
    color: rgb(0, 182, 0);
  }
</style>
