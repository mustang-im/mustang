<script>
  export let config = {};

  config.forceManual = true; // Make [Back] button work

  function protocolDisplay(protocol) {
    return protocol.toUpperCase();
  }
  function hostnameDisplay(hostname) {
    return hostname.toLowerCase();
  }
  function portDisplay(port, protocol) {
    // TODO hide default ports for protocol
    return port;
  }
  function sslDisplay(ssl) {
    // TODO Translate
    return ssl.toUpperCase();
  }
  function authDisplay(auth) {
    // TODO Translate
    return auth;
  }
</script>

<h2>Please confirm that the following configuration for {config.emailAddress} is correct</h2>

{#if config.isComplete() }

<grid id="display">
  <span class="header"/>
  <span class="header">Protocol</span>
  <span class="header">Server hostname</span>
  <span class="header">Port</span>
  <span class="header">SSL</span>
  <span class="header">Authentication</span>

  <label for="realName">Incoming mail server:</label>
  <span class="protocol">{ protocolDisplay(config.incoming.type) }</span>
  <span class="hostname">{ hostnameDisplay(config.incoming.hostname) }</span>
  <span class="port">{ portDisplay(config.incoming.port, config.incoming.type) }</span>
  <span class="ssl">{ sslDisplay(config.incoming.socketType) }</span>
  <span class="auth">{ authDisplay(config.incoming.auth) }</span>

  <label for="realName">Outgoing mail server:</label>
  <span class="protocol">{ protocolDisplay(config.outgoing.type) }</span>
  <span class="hostname">{ hostnameDisplay(config.outgoing.hostname) }</span>
  <span class="port">{ portDisplay(config.outgoing.port, config.outgoing.type) }</span>
  <span class="ssl">{ sslDisplay(config.outgoing.socketType) }</span>
  <span class="auth">{ authDisplay(config.outgoing.auth) }</span>
</grid>

{:else}
<div class="error">The configuration is not complete</div>
{/if}

<style>
  h2 {
    font-size: large;
    font-weight: bold;
  }
  #display {
    display: grid;
    grid-template-columns: repeat(6, max-content);
  }
  span.header {
    margin: 0.5em;
    color: darkgrey;
  }
  grid label {
    margin-right: 1em;
  }
  .hostname {
    font-weight: bold;
  }
</style>
