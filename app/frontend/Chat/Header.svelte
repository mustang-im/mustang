<hbox class="persons-toolbar">
  <AccountDropDown />
  <hbox flex />
  <hbox class="buttons">
    <RoundButton label="New group" icon={NewGroupIcon} iconSize="22px" padding="9px" classes="large create" on:click={() => catchErrors(addGroup)} />
  </hbox>
</hbox>

<script lang="ts">
  import AccountDropDown from "../Mail/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewGroupIcon from "lucide-svelte/icons/plus";
  import { catchErrors } from "../Util/error";
  import { NotImplemented } from "../../logic/util/util";

  function addGroup() {
    throw new NotImplemented("Creating chat groups is not yet implemented");
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: center;
  }
</style>
