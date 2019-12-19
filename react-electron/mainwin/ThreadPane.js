import React, { Component } from "react";

export default class ThreadPane extends Component {
  render() {
    return (
      <vbox id="thread-pane" flex="1">
        <fastlist id="message-list">
          <header>
            <div>From</div>
            <div>To</div>
            <div>Subject</div>
            <div>Date</div>
          </header>
          <row rowheight="20">
            <div field="authorRealname"></div>
            <div field="to"></div>
            <div field="subject"></div>
            <div field="date"></div>
          </row>
        </fastlist>
      </vbox>
    );
  }
}
