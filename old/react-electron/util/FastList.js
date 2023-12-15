import { Fastlist } from "../../trex/fastlist";
import { DOMComponent } from "./react-component";
import React, { Component } from "react";

export class FastList extends DOMComponent {
  /**
   * This will be called whenever the properties change.
   * The |rootElement| is just a <div>, underneath which
   * you add your custom DOM elements.
   * Do not change the <div> itself.
   *
   * TODO Do *not* re-create on every prop change.
   */
  async createDOM(rootElement) {
    assert(rootElement && rootElement.localName, "need DOM element");
    var element = rootElement.documentElement.createElement("fastlist");
    rootElement.appendChild(element);
    new Fastlist(element);
  }
}

export function Header() {
  return <hbox />;
}

export function Row() {
  return <hbox />;
}
