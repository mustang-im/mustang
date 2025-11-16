<vbox class="app-selector">
  <RoundButton
    label="Contact history"
    icon={HistoryIcon}
    onClick={() => selectApp("history")}
    classes="plain" border={false}
    selected={app == "history" && isOpen}
    />
</vbox>

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import HistoryIcon from "lucide-svelte/icons/history";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ selected: any }>();

  /** selected app - in/out */
  export let app: any;
  /** whether sidebar should be open - in only */
  export let isOpen: boolean

  function selectApp(anApp: any) {
    app = anApp;
    dispatch("selected", app);
  }
</script>

<style>
  .app-selector {
    margin-block: 12px;
  }
</style>
