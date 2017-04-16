require("app-module-path").addPath(__dirname + "/");
var makeNewAccount = require("logic/account/account-setup").makeNewAccount;

function startTest(errorCallback, successCallback) {
  var emailAddress = "fred@yahoo.com";
  var password = "Wilma";
  makeNewAccount(emailAddress, function(account) {
    account.setPassword(password);
    account.login(true, function() {
      successCallback();
    }, errorCallback);
  }, errorCallback);
}

exports.startTest = startTest;
