<hbox class="cancelled-invitation">
  <hbox class="cancelled-text">
    {$t`This meeting has been cancelled by the organizer`}
  </hbox>
</hbox>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
</script>

<style>
  .cancelled-invitation {
    align-items: center;
    justify-content: center;
    margin-block-start: 16px;
  }
  .cancelled-text {
    flex-wrap: wrap;
    background-color: rgba(255, 166, 0, 0.291);
    padding: 8px 12px;
    border-radius: 3px;
    margin: 8px;
  }
</style>
