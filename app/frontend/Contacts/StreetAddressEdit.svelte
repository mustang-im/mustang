<vbox flex>
  <input type="text"
    bind:value={streetAddress.instructions}
    placeholder={$t`Delivery instructions (optional)`}
    class="instructions"
    maxlength={200}
    on:input={onChange}
    />
  <input type="text"
    bind:value={streetAddress.street}
    placeholder={$t`Street and house number`}
    class="street"
    maxlength={60}
    on:input={onChange}
    />
  <input type="text"
    bind:value={streetAddress.city}
    placeholder={$t`City`}
    class="city"
    maxlength={60}
    on:input={onChange}
    />
  <input type="text"
    bind:value={streetAddress.postalCode}
    placeholder={$t`Post code`}
    on:input={onChange}
    class="postcode"
    maxlength={10}
    />
  <input type="text"
    bind:value={streetAddress.state}
    placeholder={$t`State (optional)`}
    class="state"
    maxlength={30}
    on:input={onChange}
    />
  <input type="text"
    bind:value={streetAddress.country}
    placeholder={$t`Country`}
    class="country"
    maxlength={30}
    on:input={onChange}
    />
</vbox>

<script lang="ts">
  import { StreetAddress } from "../../logic/Contacts/StreetAddress";
  import { t } from "../../l10n/l10n";
  import { tick } from "svelte";

  export let value: string; /* in/out */

  let streetAddress: StreetAddress;
  let changing = false;
  $: if (!changing) {
    streetAddress = new StreetAddress(value);
  }

  async function onChange() {
    changing = true;
    value = streetAddress.toString();
    await tick();
    changing = false;
  }
</script>

<style>
</style>
