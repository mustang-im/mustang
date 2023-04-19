<hbox class="person">
  <vbox class="image">
    <img
      src={person.picture}
      width="64" height="64"
      title="Picture of {person.name}"
      alt="Picture of {person.name}" />
  </vbox>
  <vbox class="right">
    <hbox class="name">{person.name}</hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";

  export let person: Person;
</script>

<style>
  .person, .right, .name {
    flex: 1 0 0;
  }
  .image {
    width: 64px;
    height: 64px;
    margin: 10px;
    clip-path: circle();
  }
  .right {
    margin: 10px;
    border-bottom: 1px dotted lightgray;
  }
</style>
