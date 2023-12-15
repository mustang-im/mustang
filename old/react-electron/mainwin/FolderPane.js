import { FastList, Header, Row } from "../util/FastList.js";
import React, { Component } from "react";

export default class FolderPane {
  render() {
    return (
      <vbox id="folder-pane" flex="4">
        <FastList id="folder-list">
          <Header>
            <div>Folders</div>
          </Header>
          <Row rowheight="20">
            <div field="name"></div>
          </Row>
        </FastList>
      </vbox>
    );
  }
}
