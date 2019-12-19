import { getDateString } from "../util/dataFormat";

import React, { Component } from "react";

export default class MessagePane extends Component {
  render() {
    if ( !this.props.message) {
      return <vbox id="message-pane" flex="2"></vbox>;
    }

    return (
      <vbox id="message-pane" flex="2">
        <MessageHeaderPane message={ this.props.message } />
        <MessageBodyPane message={ this.props.message } />
      </vbox>
    );
  }
}

class MessageHeaderPane extends Component {
  render() {
    let msg = this.props.message:
    return (
      <!-- TODO: Use CSS grid -->
      <vbox id="header-pane">
        <hbox><label>Subject:</label> <label id="msg-subject">{ msg.subject }</label></hbox>
        <hbox><label>From:</label> <label id="msg-from">{ msg.authorRealname }</label></hbox>
        <hbox><label>Date:</label> <label id="msg-date">{ getDateString(msg.date) }</label></hbox>
      </vbox>
    );
  }
}

class MessageBodyPane extends Component {
  render() {
    let message = this.props.message:
    if ( !message) {
      return <vbox id="msg-body-box" flex="1"></vbox>;
    }

    if ( !this.state.bodyPlaintext) {
      (async () => {
        try {
          this.state.bodyPlaintext = await message.bodyPlaintext();
          this.setState(this.state);

          // Mark as read
          await message.markAsRead(true);
        } catch (e) {
          console.error(e);
          //backgroundError(e);
        }
      })();
    }

    return (
      <vbox id="msg-body-box" flex="1">
        <div id="msg-body-plaintext">
          { this.state.bodyPlaintext }
        </div>
        <iframe id="msg-body-frame" flex="1">
        </iframe>
      </vbox>
    );
  }
}
