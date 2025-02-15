<vbox flex class="paper">
  <slot/>
</vbox>

<style>
.paper {
  background-color: var(--main-bg);
  color: var(--main-fg);
  border-radius: 5px;
  box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
}
</style>
