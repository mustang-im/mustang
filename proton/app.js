import React, { Component } from "react";
import { render, App } from "proton-native";
import MainWindow from "./mainwin/mainwin";

class MailApp extends Component {
  render() {
    return (
      <App>
        <MainWindow />
      </App>
    );
  }
}

render(<MailApp />);
