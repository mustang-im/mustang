import { FastList, Header, Row } from "../util/FastList.js";
import React, { Component } from "react";

export default class ThreadPane extends Component {
  render() {
    return (
      <vbox id="thread-pane" flex="1">
        <FastList id="message-list">
          <Header>
            <div>From</div>
            <div>To</div>
            <div>Subject</div>
            <div>Date</div>
          </Header>
          <Row rowheight="20">
            <div field="authorRealname"></div>
            <div field="to"></div>
            <div field="subject"></div>
            <div field="date"></div>
          </Row>
        </FastList>
      </vbox>
    );
  }
}
