import React, { Component } from "react";
import { render, Window, App, Box, Button, Text, TextInput } from "proton-native";
import CollTable from "../widget/CollTable";

import { getAllAccounts } from "../../logic/account/account-list.js";

export default class MainWindow extends Component {
  render() {
    return (
      <Window title="Corvette" size={{ w: 800, h: 500 }}>
        <Box padded="true">
          <CollTable
              collection={ getAllAccounts() }
              columns={{
                emailAddress: "E-Mail Address",
                isLoggedIn: "Logged in",
              }}
              />
        </Box>
      </Window>
    );
  }
}
