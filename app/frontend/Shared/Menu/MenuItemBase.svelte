<vbox class="menuitem {classes}"
  class:disabled
  on:click on:dblclick
  on:click={myOnClick}
  title={typeof(disabled) == "string" ? disabled : tooltip}
  {tabindex}
  >
</vbox>

<script lang="ts">
  import { showError } from '../../Util/error';

  export let classes = "";
  export let loading: boolean = false;
  /** If true or a string, refuse input and make it grey.
   * If a string, this string will be shown as tooltip. This allows you to inform the user
   * about the reason why the button is disabled */
  export let disabled: boolean | string = false;
  export let tooltip: string;
  export let tabindex = null;
  export let onClick: (event: Event) => void = null;
  export let errorCallback = showError;

  async function myOnClick(event: Event) {
    if (!(onClick && typeof(onClick) == "function")) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    let previousDisabled = disabled;
    disabled = true;
    let loadTimeout = setTimeout(() => {
      loading = true;
    }, 500);
    try {
      await onClick(event);
    } catch (ex) {
      errorCallback(ex);
    } finally {
      clearTimeout(loadTimeout);
      loading = false;
    }
    disabled = previousDisabled;
  }
</script>

<style>
  .menuitem:hover:not(.disabled) {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .disabled {
    opacity: 50%;
  }
</style>
