require("app-module-path").addPath(__dirname + "/");
var Waiter = require("util/waiter").Waiter;

function runTests() {
  console.log("Running tests...");
  var waiter = new Waiter(() => console.log("Tests succeeded"), showError);
  waiter.reportOnlyFirstError = false;
  require("logic/account/test/test-account-setup").startTest(waiter.success(), waiter.error());
}

function showError(ex) {
  console.error(ex);
  if (ex.stack) {
    console.error("Stack:\n" + ex.stack);
  }
}

runTests();
