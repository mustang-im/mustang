<!-- From <https://github.com/HenryLie/svelte-i18n-lingui/blob/main/src/lib/LegacyT.svelte> -->
<script>
	import { t } from './l10n';
  import { onMount } from "svelte";

	/**
	 * @type {string}
	 */
	export let msg;

	let strings = [];

  onMount(parse);

  $: parse();

	function parse() {
		strings = $t([msg]).split('#');

		if (strings.length > 6) {
			console.error('svelte-i18n-lingui:', '<T> component can only have a maximum of 5 slots.');
		}

		// TODO: Other prop validations
		//
		//   else if (strings.length < 2) {
		// 	console.error(
		// 		'svelte-i18n-lingui:',
		// 		'<T> component must only be used for interpolation and contain at least one # sign for slots.'
		// 	);
		// } else if (strings.length !== Object.keys($$slots).length + 1) {
		// 	console.error(
		// 		'svelte-i18n-lingui:',
		// 		"The number of slots on the message and the one passed in to the component dosent't match"
		// 	);
		// } else {
		// 	strings.slice(1).forEach((str, i) => {
		// 		if (i === 0 && $$slots.default) {
		// 			console.error('abc');
		// 		}
		// 	});
		// }
	};
</script>

<!--
@component
A translation component used to support interpolation.
If there is no need to interleave elements or components inside a message,
the `t` store should be used instead for simplicity and consistency.

- Usage:
  ```svelte
  <T msg="Click # for more information" ctx="if any" cmt="if any">
    <a href="https://example.com">{$t`here`}`</a>
  </T>
  ```
-->

<!-- Put in the same line to prevent automatic whtiespace insertion -->
{strings[0] ?? ''}<slot />{strings[1] ?? ''}<slot name="1" />{strings[2] ?? ''}<slot
	name="2"
/>{strings[3] ?? ''}<slot name="3" />{strings[4] ?? ''}<slot name="4" />{strings[5] ?? ''}