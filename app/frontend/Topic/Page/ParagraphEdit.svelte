<vbox class="paragraph font-normal">
  <!-- TODO SECURITY Sanitize HTML first before passing it in here.
    One option: A dedicated getter/setter for the editor that sanitizes on get, but doesn't trigger observers on set.
    Binding `descriptionHTML` calls observers, which re-sets `html`, which force-kills the editor. #727 -->
  <HTMLEditor bind:html={paragraph.rawHTMLDangerous} bind:editor />
</vbox>

<script lang="ts">
  import { Paragraph } from "../../../logic/Topic/PageContent";
  import { Topic } from "../../../logic/Topic/Topic";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import type { Editor } from "@tiptap/core";

  export let topic: Topic;
  export let paragraph: Paragraph;
  /** out only */
  export let editor: Editor;
</script>

<style>
</style>
