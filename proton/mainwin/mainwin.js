import React, { Component } from "react";
import { render, Window, App, Box, Button, Text, Form, TextInput } from "proton-native";
import CollTable from "../widget/CollTable";

import { getAllAccounts } from "../../logic/account/account-list.js";

export default class MainWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      folder: null,
      message: null,
    };
  }
  render() {
    return (
      <Window title="Corvette" size={{ w: 800, h: 500 }}>
        <Box vertical={false}>
          <Box vertical={true}>
            <Box padded={true}>
              <CollTable
                  collection={ getAllAccounts() }
                  columns={{
                    emailAddress: "Account",
                  }}
                  onClick={ async account => {
                    this.state.account = account;
                    await account.login();
                    await account.inbox.fetch();
                    this.setState(this.state);
                  }}
                  />
            </Box>
            <Box padded={true}>
              { this.state.account &&
                <CollTable
                    collection={ this.state.account.folders }
                    columns={{
                      name: "Folder",
                    }}
                    onClick={ folder => {
                      this.state.folder = folder;
                      this.setState(this.state);
                    }}
                    />
              }
            </Box>
          </Box>
          <Box vertical={true}>
            <Box padded={true}>
              { this.state.folder &&
                <CollTable
                    collection={ this.state.folder.messages }
                    columns={{
                      authorRealname: "From",
                      subject: "Subject",
                      date: "Date",
                    }}
                    onClick={ message => {
                      this.state.message = message;
                      this.setState(this.state);
                    }}
                    />
              }
            </Box>
            { this.state.message &&
              <Box vertical={true}>
                <Box padded={true}>
                  <Form>
                    <Text label="Subject">{ this.state.message.subject }</Text>
                    <Text label="From">{ this.state.message.authorRealname } { this.state.message.authorEmailAddress }</Text>
                    <Text label="Date">{ this.state.message.date }</Text>
                  </Form>
                </Box>
                <Box padded={true}>
                  <Text>
                    { (async () => {
                      try {
                        return await this.state.message.bodyPlaintext();
                      } catch (ex) {
                        return ex.message || String(ex);
                      }
                    })() }
                  </Text>
                </Box>
              </Box>
            }}
          </Box>
        </Box>
      </Window>
    );
  }
}
