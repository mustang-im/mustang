<script lang="ts">
	import { t } from './l10n';
  import { onMount } from "svelte";

  /**
   * Allows to add Svelte components and HTML elements in the middle of a translated string.
   * Usage:
   * ```svelte
   * <T msg="Read our # or # for more information">
   *   <a href="https://help.example.com">{$t`help`}`</a>
   *   <a href="https://docs.example.com" slot="2">{$t`docs`}`</a>
   * </T>
   * ``` */

	export let msg: string;

	let strings: string[] = [];
  onMount(split);
	function split() {
		strings = $t([msg]).split('#');
		if (strings.length > 5) {
			console.error('<T> component can only have a maximum of 5 slots. Bad string is:', ...strings);
		}
	};
</script>

<!-- No newlines, to avoid whitespaces inserted into the string -->
{strings[0] ?? ''}<slot />{strings[1] ?? ''}<slot name="2" />{strings[2] ?? ''}<slot
ame="3" />{strings[3] ?? ''}<slot name="4" />{strings[4] ?? ''}<slot
name="5" />{strings[5] ?? ''}
