<vbox class="app-logo">
  <Icon data={logo} size="20px" />
</vbox>
<h1>{appName} {appVersion}</h1>

<div>
  <T msg="Copyright 2024 Ben Bucksch, #, and other contributors">
    <a href="{siteRoot}" target="_blank">{appName == "Parula" ? "Beonex GmbH" : "Mustang GmbH"}</a>
  </T>
</div>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../../asset/icon/general/logo.svg?raw';
  import { appName, appVersion, siteRoot } from '../../../logic/build';
  import T from '../../../l10n/T.svelte';
</script>

<style>
</style>
