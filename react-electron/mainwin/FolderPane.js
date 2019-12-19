import React, { Component } from "react";

export default class FolderPane {
  render() {
    return (
      <vbox id="folder-pane" flex="4">
        <fastlist id="folder-list">
          <header>
            <div>Folders</div>
          </header>
          <row rowheight="20">
            <div field="name"></div>
          </row>
        </fastlist>
      </vbox>
    );
  }
}
