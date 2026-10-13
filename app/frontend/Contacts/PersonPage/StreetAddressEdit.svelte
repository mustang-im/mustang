<vbox flex>
  <input type="text"
    bind:value={streetAddress.instructions}
    placeholder={$t`Delivery instructions (optional)`}
    class="instructions"
    maxlength={200}
    on:input={onInput}
    />
  <input type="text"
    bind:value={streetAddress.street}
    placeholder={$t`Street and house number`}
    class="street"
    maxlength={60}
    on:input={onInput}
    />
  <input type="text"
    bind:value={streetAddress.city}
    placeholder={$t`City`}
    class="city"
    maxlength={60}
    on:input={onInput}
    />
  <input type="text"
    bind:value={streetAddress.postalCode}
    placeholder={$t`Post code`}
    on:input={onInput}
    class="postcode"
    maxlength={10}
    />
  <input type="text"
    bind:value={streetAddress.state}
    placeholder={$t`State (optional)`}
    class="state"
    maxlength={30}
    on:input={onInput}
    />
  <input type="text"
    bind:value={streetAddress.country}
    placeholder={$t`Country`}
    class="country"
    maxlength={30}
    on:input={onInput}
    />
</vbox>

<script lang="ts">
  import { StreetAddress } from "../../../logic/Contacts/StreetAddress";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";
  import { tick } from "svelte";

  export let value: string; /* in/out */

  let streetAddress: StreetAddress;
  let changing = false;
  $: if (!changing) {
    streetAddress = new StreetAddress(value);
  }

  function onInput() {
    catchErrors(onChange);
  }

  async function onChange() {
    changing = true;
    value = streetAddress.toString();
    await tick();
    changing = false;
  }
</script>

<style>
  :global(.mobile) input {
    margin-block: 8px;
  }
</style>
