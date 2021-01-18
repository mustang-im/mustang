<script>
  export let config;

  function onEmailAddressChanged() {
    config.password = "";
  }

  let passwordVisible = false;
  function togglePasswordView() {
    passwordVisible = !passwordVisible;
  }
</script>

<grid id="input" class="inputs">
  <label for="realName">Your name:</label><input id="realName" type="text" bind:value={config.realName} placeholder="Fred Flintstone" required /><span class="explanation">Your name, as shown to others</span>
  <label for="emailAddress">Email address:</label><input id="emailAddress" type="email" bind:value={config.emailAddress} required pattern="[a-z0-9\-%+_\.\*]+@[a-z0-9\-\.]+\.[a-z]+" x-moz-errormessage="Please specify a valid email address" on:keypress={onEmailAddressChanged} /><span class="explanation">Your existing email address</span>
  <label for="password">Password:</label>
  {#if passwordVisible }
  <input id="password" type="text" bind:value={config.password} required />
  {:else}
  <input id="password" type="password" bind:value={config.password} required />
  {/if}
  <span on:click={togglePasswordView}>Eye</span>
</grid>

<style>
  grid.inputs {
    display: grid;
    grid-template-columns: max-content auto auto;
  }
  grid.inputs label {
    margin-right: 0.8em;
  }
  grid.inputs .explanation,
  grid.inputs span {
    margin-left: 1em;
    color: darkgrey;
  }
  input:invalid {
    border: 1px solid red;
  }
</style>
