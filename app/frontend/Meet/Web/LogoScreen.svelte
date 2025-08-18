<hbox flex>
  <vbox flex class="center-container">
    <vbox class="center">
      <Icon data={logo} size="128px" />
      <a href={siteRoot} target="_blank">
        {appName}
      </a>
    </vbox>
  </vbox>
</hbox>

<script lang="ts">
  import { appName, siteRoot } from "../../../logic/build";
  import Icon from '../../Shared/Icon.svelte';
  import logo from '../../asset/icon/general/logo.svg?raw';
</script>

<style>
  .center-container {
    align-items: center;
    justify-content: center;
  }
</style>
