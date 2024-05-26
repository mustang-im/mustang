<HeaderGroupBox>
  <hbox slot="header">
    Notifications
  </hbox>
  <hbox class="subtitle">When a new mail arrives, show:</hbox>
  <NotificationKinds />
</HeaderGroupBox>

<script lang="ts">
  import NotificationKinds from "./NotificationKinds.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
</script>

<style>
  .subtitle {
    margin-bottom: 16px;
  }
</style>
