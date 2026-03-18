<hbox class="empty" />
<hbox class="empty" />
<hbox class="top" />
<hbox class="empty" />
<hbox class="empty" />

<hbox class="empty" />
<hbox class="empty" />
<hbox class="logo center-bar">
  <Icon data={logo} size="24px" />
</hbox>
<hbox class="empty" />
<hbox class="empty" />

<script lang="ts">
  import Icon from "../../Shared/Icon.svelte";
  import logo from '../../asset/icon/general/logo.svg?raw';
</script>

<style>
  .logo {
    width: 28px;
    border-top-left-radius: 32px;
    border-top-right-radius: 32px;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
  }
</style>
