<script>
  import { onMount, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let config = {};

  onMount(() => {
    if (config.isComplete() && !config.forceManual) {
      dispatch("continue");
    }
  });

  const sslOptions = {
    "ssl": "Normal SSL / TLS",
    "starttls": "STARTTLS",
    "plain": "No encryption",
  };

  const authOptions = {
    "passwordCleartext": "Password",
    "oauth2": "OAuth2, possibly 2FA",
    "web": "Web page login",
    "passwordEncrypted": "Encrypted password",
    "NTLM": "Windows NTLM",
    "GSSAPI": "Kerberos or GSSAPI",
    "ssl-cert": "SSL client certificate",
    "none": "No authentication",
  };

  const incomingProtocols = {
    "imap": "IMAP",
    "pop3": "POP3",
    "exchange": "Exchange",
  };

  function propToArray(obj) {
    return Object.entries(obj).map(e => ({ name: e[0], label: e[1] }));
  }
</script>

<h2>Please enter the configuration for {config.emailAddress}</h2>

<grid id="display">
  <span class="header"/>
  <span class="header">Protocol</span>
  <span class="header">Server hostname</span>
  <span class="header">Port</span>
  <span class="header">SSL</span>
  <span class="header">Authentication</span>
  <span class="header">Username</span>

  <label for="realName">Incoming mail server:</label>
  <select bind:value={config.incoming.type}>
    {#each propToArray(incomingProtocols) as protocol }
      <option value={protocol.name}>
        {protocol.label}
      </option>
    {/each}
  </select>
  <input type="text" bind:value={config.incoming.hostname} required />
  <input type="number" bind:value={config.incoming.port} required min="1" max="65536" />
  <select bind:value={config.incoming.auth}>
    {#each propToArray(sslOptions) as option }
      <option value={option.name}>
        {option.label}
      </option>
    {/each}
  </select>
  <select bind:value={config.incoming.auth}>
    {#each propToArray(authOptions) as option }
      <option value={option.name}>
        {option.label}
      </option>
    {/each}
  </select>
  <input type="text" bind:value={config.incoming.username} required />

  <label for="realName">Outgoing mail server:</label>
  <span class="protocol">SMTP</span>
  <input type="text" bind:value={config.outgoing.hostname} required />
  <input type="number" bind:value={config.outgoing.port} required min="1" max="65536" />
  <select bind:value={config.outgoing.auth}>
    {#each propToArray(sslOptions) as option }
      <option value={option.name}>
        {option.label}
      </option>
    {/each}
  </select>
  <select bind:value={config.outgoing.auth}>
    {#each propToArray(authOptions) as option }
      <option value={option.name}>
        {option.label}
      </option>
    {/each}
  </select>
  <input type="text" bind:value={config.incoming.username} required />
</grid>

<style>
  h2 {
    font-size: large;
    font-weight: bold;
  }
  #display {
    display: grid;
    grid-template-columns: repeat(7, max-content);
  }
  span.header {
    color: darkgrey;
  }
  grid > * {
    margin: 0.3em;
  }
  grid label {
    margin-right: 1em;
  }
</style>
