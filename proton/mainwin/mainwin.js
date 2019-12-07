import React, { Component } from "react";
import { render, Window, App, Box, Button, TextInput } from "proton-native";

import { getAllAccounts } from "../../logic/account/account-list.js";

class MainWin extends Component {
  render() {
    return (
      <App>
        <Window title="Example" size={{ w: 800, h: 500 }}>
          <Box>
            <Button>Hello</Button>
            <TextInput />
          </Box>
        </Window>
      </App>
    );
  }
}

render(<MainWin />);

console.log(getAllAccounts().contents);
