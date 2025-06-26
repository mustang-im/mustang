<vbox class="streetaddress">
  {#if streetAddress.instructions}
    <hbox class="instructions">{streetAddress.instructions}</hbox>
  {/if}
  <hbox class="street">{streetAddress.street ?? ""}</hbox>
  <hbox class="city">
    {streetAddress.postalCode ?? ""}
    {streetAddress.city ?? ""}{streetAddress.state ? ", " : ""}
    {streetAddress.state ?? ""}
  </hbox>
  {#if streetAddress.country}
    <hbox class="country">{streetAddress.country}</hbox>
  {/if}
</vbox>

<script lang="ts">
  import { StreetAddress } from "../../logic/Contacts/StreetAddress";

  export let value: string;

  // $: console.log("street address string", value);
  $: streetAddress = new StreetAddress(value);
  // $: console.log("street address parsed", streetAddress?.toJSON());
</script>

<style>
</style>
