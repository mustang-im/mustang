require("app-module-path").addPath(__dirname + "/");
const findAccountConfig = require("logic/account/setup/setup").findAccountConfig;
const addNewAccountFromConfig = require("logic/account/account-list").addNewAccountFromConfig;

function startTest(errorCallback, successCallback) {
  var emailAddress = "fred@yahoo.com";
  var password = "Wilma";
  findAccountConfig(emailAddress, async config => {
    let account = await addNewAccountFromConfig(config);
    account.setPassword(password);
    account.login(true, successCallback, errorCallback);
  }, errorCallback);
}

exports.startTest = startTest;
