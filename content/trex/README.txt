  0. Summary

TRex is a HTML UI markup language and JS library.
It provides a thin shim layer on top of HTML5 that brings the
tags, programming style, and expressiveness of XUL to HTML. There is
an <hbox>, <vbox>, <textbox>, <menu> and the like.


  1. Motivation

XUL was the XML UI Language. The idea to use markup to define UI dialogs
was great. Microsoft imitated XUL and named it XAML, which is core to .NET today.
TRex is the HTML UI markup language.


  1.1. Layout

HTML was designed for pages of human language text, for flow text. Pages
are made up from <div>s (block) and <span>s (inline) and scroll away to
the bottom, and the layout happens with the CSS box model. It is
difficult to create something like the typical 5-pane UI layout,
with fixed header, left and right fixed sidebar, and bottom.
Just centering something is unbelievably complex
<https://css-tricks.com/centering-css-complete-guide/>
<http://vanseodesign.com/css/vertical-centering/>.
In XUL, all of these are trivial with just one or a few <hbox>/<vbox> elements.
And it's much faster to render, too. (Before you say flexbox, read on.)


  1.2. Widgets

In normal GUI applications, the "widget kit", e.g. GTK, Qt, Win32 etc.,
is the fundamental building block, offering layout (last section) and
"widgets", meaning button, checkbox, textbox, menu, and the like. In
HTML, we have <input> and <button>, but <input type="checkbox">. One
widget has the text as child node inside, the other as attribute, and I
can never remember which one has which. The events (e.g. the "command"
event in XUL) are different for each widget. There is no menu, no
treeview, no listbox, no proper autocomplete dropdown that fills based
on input. All the functionality is there, you can build everything, but
it's very cumbersome.
None of jQuery, jQueryUI nor AngularJS fill this particular gap of a
providing basic, fundamental set of widgets with a coherent API.
Simply put: HTML5, when used for application GUIs, lacks the easy of
use, expressiveness, clarity and consistency of a coherent widget kit.


  2. TRex: GUI-oriented layout and widget elements

The idea of TRex is to provide a thin shim layer on top of HTML5 that
brings the tags, programming style, and expressiveness of XUL to HTML.
There is an <hbox>, <vbox>, <textbox>, <menu> and the like. There is a
common "command" and "changed" event for all widgets that it applies to.
It is consistent and coherent, and easy to structure and read. You start
with <html><head>,<body>, but from there continue with <hbox>/<vbox>,
<grid> and <checkbox> and so forth, like in XUL.


  2.1. Layout

<hbox> and <vbox> will be based on CSS flexbox (and optionally on the
-moz-box, which closely matches the XUL box, if available (Firefox and
Chrome) and you wish), so they should be fast.


  2.2. Widget objects

Widget object functions will be added directly to the DOM elements, and
attributes and JS properties will be synced, so you can do
E("okButton").press(); or E("red").checked = true;, and it will work as
expected and trigger the "changed" event for you.


  3. Complementary libraries

Aside from the XUL tags for layout and GUI elements, there will be a
separate project for l10n / translation, and for overlays. These are
optional, complementary components and do not depend on each other.


  3.1. Translation

There is a StringBundle class based on Myk's nice JS class API, but
implemented in pure JS to load our normal properties file format, and
extended e.g. for placeholders.
JS: var gFooBundle = new StringBundle("email/foo.properties");
     translateElements(document, gFooBundle, {"brand": brandName });
HTML: <label for="password" translate="password" />
takes the stringbundle value for "password", replaces placeholder
%brand% with brandName, and inserts a text node as child of the <label>.
Similarly, <a translate-attr="tooltip=resetpassword"> would take the
stringbundle text for "resetpassword" and set it as value for attribute
tooltip, e.g. end up as <a tooltip="This will allow you to reset...">.
We already use this in production in a commercial product with many users.
Downside: If you come from XUL, you'll have to change all XUL code from
XML entities to this format.
Upside: One unified translated string format for both markup and JS code.


  3.2. Overlays

There'll be a mechanism similar to XUL overlays, for the purpose of code
modularization and separation of concerns. Modularization is critical
esp. in larger applications.
The file format will probably be similar to XUL overlays. Hookups might
still work with id="" for compat, but will primarily use CSS selectors
like <el hook="#bar > textbox">, implemented using querySelectorAll().
That removes the need to add element IDs purely to allow extension
hookups. It even allows multiple instantiations per page.
I'll try to get rid of a central chrome.manifest statement, at least for
the developer, because it destroys modularity, maybe generate it if
necessary.
Being implemented entirely in JS, these overlays will normally load
early at page load, but can also be added later and also be removed with
a central 'remove overlay' function (not all manual DOM poking for
removal like in bootstrap addons). I will try to make them compatible
with AngularJS, if possible.


  3.3. XBL

There will be nothing like XBL. No anonymous content, obviously.
Widgets will be an object class hierarchy, though, and you can extend
existing widgets using pure JS. This should give the same functionality,
but in a language that's much better known.
Some cases might be better implemented with overlays attaching multiple
times (see above).


  4. Target audience

I hope that TRex will help people who are coming from native
application development to HTML. It might also help new HTML5
application projects that need to build large GUI applications with a
native-feeling UI, for example possibly a future Thunderbird or
similarly big custom applications.

It does not replace AngularJS or similar JS libraries, but rather
complements it. TRex and AngularJS simply solve different problems.
Ditto Tween, jQuery, jQueryUI. TRex doesn't depend on them, nor
should interfere with them.


  5. Status

I have some basic code that is usable, but it's far from complete. In
true open-source bazar nature, I throw it out there and see whether
people find it useful or like it. Contributors welcome.

https://github.com/benbucksch/trex
