<hbox class="app-menu-button">
  <RoundButton
    icon={logo}
    iconSize="32px"
    label="Switch apps"
    classes="plain small"
    border={true}
    padding="6px"
    />
</hbox>

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import logo from '../../asset/icon/general/logo.svg?raw';
</script>

<style>
  .app-menu-button.no {
    width: 40px;
    height: 40px;
    margin: 1px;
    padding: 2px;
    border: 1px solid white;
    border-radius: 50px;
  }
</style>
