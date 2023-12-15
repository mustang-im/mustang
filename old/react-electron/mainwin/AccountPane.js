import { FastList, Header, Row } from "../util/FastList.js";
import React, { Component } from "react";

export default class AccountPane {
  render() {
    return (
      <vbox id="account-pane" flex="1">
        <FastList id="account-list">
          <Header>
            <div>Accounts</div>
          </Header>
          <Row rowheight="20">
            <div field="emailAddress"></div>
          </Row>
        </FastList>
      </vbox>
    );
  }
}
