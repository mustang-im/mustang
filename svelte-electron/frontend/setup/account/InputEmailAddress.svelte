<script>
  export let config;
  export let canContinue;

  function onEmailAddressChanged() {
    //config.password = "";
  }

  let enteredRealName = false;
  let enteredEmailAddress = false;
  let enteredPassword = false;
  let passwordVisible = false;
  function togglePasswordView() {
    passwordVisible = !passwordVisible;
  }
</script>

<grid id="input" class="inputs">
  <label for="realName">Your name:</label>
  <input type="text"
    id="realName"
    bind:value={config.realName}
    placeholder="Fred Flintstone"
    class:entered={enteredRealName} on:blur={() => enteredRealName = true }
    required />
  <span class="validity"/>
  <span class="explanation">Your name, as shown to others</span>

  <label for="emailAddress">Email address:</label>
  <input type="email"
    id="emailAddress"
    bind:value={config.emailAddress}
    required
    pattern="[a-z0-9\-%+_\.\*]+@[a-z0-9\-\.]+\.[a-z]+"
    x-moz-errormessage="Please specify a valid email address"
    class:entered={enteredEmailAddress} on:blur={() => enteredEmailAddress = true }
    on:keypress={onEmailAddressChanged} />
  <span class="validity"/>
  <span class="explanation">Your existing email address</span>

  <label for="password">Password:</label>
  {#if passwordVisible }
  <input type="text" bind:value={config.password} required
    class:entered={enteredPassword} on:blur={() => enteredPassword = true } />
  {:else}
  <input type="password" bind:value={config.password} required
    class:entered={enteredPassword} on:blur={() => enteredPassword = true } />
  {/if}
  <span class="validity"/>
  <span on:click={togglePasswordView}>Eye</span>
</grid>

<style>
  grid.inputs {
    display: grid;
    grid-template-columns: max-content auto max-content auto;
  }
  grid.inputs label {
    margin-right: 0.8em;
  }
  grid.inputs .explanation,
  grid.inputs span {
    margin-left: 1em;
    color: darkgrey;
  }
  input.entered:invalid {
    border: 2px solid red;
  }
  input.entered:invalid+.validity:after {
    content: '✖';
    padding-left: 5px;
    color: red;
  }
  input:valid+.validity:after {
    content: '✓';
    padding-left: 5px;
    color: green;
  }
</style>
