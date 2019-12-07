import React, { Component } from "react";
import { render, Window, App, Box, Button, Text, TextInput } from "proton-native";

import { getAllAccounts } from "../../logic/account/account-list.js";

export default class MailApp extends Component {
  render() {
    return (
      <Window title="Example" size={{ w: 800, h: 500 }}>
        <Box>
          <Button>Hello</Button>
          { getAllAccounts().contents.map(account =>
            <Text>{ account.emailAddress }</Text>
          ) }
          <TextInput />
        </Box>
      </Window>
    );
  }
}
