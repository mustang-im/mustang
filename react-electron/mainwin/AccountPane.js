import React, { Component } from "react";

export default class AccountPane {
  render() {
    return (
      <vbox id="account-pane" flex="1">
        <fastlist id="account-list">
          <header>
            <div>Accounts</div>
          </header>
          <row rowheight="20">
            <div field="emailAddress"></div>
          </row>
        </fastlist>
      </vbox>
    );
  }
}
