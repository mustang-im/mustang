<vbox class="app-logo">
  <Icon data={logo} size="20px" />
</vbox>
<h1>{appName}</h1>

<div>Copyright 2024
  Ben Bucksch,
  <a href="{siteRoot}" target="_blank">{appName == "Parula" ? "Beonex GmbH" : "Mustang GmbH"}</a>,
  and other contributors</div>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../../asset/icon/general/logo.svg?raw';
  import { appName, siteRoot } from '../../../logic/build';
</script>

<style>
</style>
