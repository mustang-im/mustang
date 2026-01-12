<!-- Lets the user pick which kind of special action he wants to add to the message,
 and adds an empty data structure to `sml`.
 The actual editing then happens in `SMLCreateKinds` -->
<vbox>
  <hbox class="title">{$t`Add`}</hbox>
  <hbox class="actions">
    <Button
      label={$t`Poll`}
      icon={PollIcon}
      onClick={addPoll}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLParseProcessor";
  import type { TSMLChooseAction } from "../../../logic/Mail/SML/TSML";
  import Button from "../../Shared/Button.svelte";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import type { Json } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ close: void }>();

  export let sml: SMLData;

  function addPoll() {
    setSML("ChooseAction", {
      description: "",
      actionOption: [],
      object: null,
      agent: null,
    } as TSMLChooseAction);
    close();
  }

  function setSML(type: string, json: Json) {
    sml ??= new SMLData();
    sml.type = type;
    sml.context = "https://schema.org";
    json["@context"] = sml.context;
    json["@type"] = sml.type;
    sml.sml = json;
  }

  function close() {
    dispatchEvent("close");
  }
</script>

<style>
  .title {
    font-weight: bold;
    margin-block-end: 16px;
  }
  .actions {
    flex-wrap: wrap;
  }
  .actions :global(button.button) {
    padding: 12px 16px;
  }
</style>
