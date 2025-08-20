<hbox class="app-menu-button">
  <RoundButton
    icon={logo}
    iconSize="32px"
    label="Switch apps"
    classes="plain small"
    border={false}
    padding="6px"
    {onClick}
    />
</hbox>

<script lang="ts">
  import { goTo } from "../selectedApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import logo from '../../asset/icon/general/logo.svg?raw';

  export let onClick = onOpen;

  function onOpen() {
    goTo("/app-menu/", {});
  }
</script>

<style>
  .app-menu-button {
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin: 1px;
    padding: 2px;
  }
</style>
