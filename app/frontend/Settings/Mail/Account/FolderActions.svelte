<hbox class="buttons">
  <slot name="buttons-bottom-right" />
</hbox>

<style>
  .buttons {
    justify-content: end;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
    color: black;
  }
</style>
