var util = require("/util/util.js");
util.importAll(util, this);
importAll(require("/logic/mail/account-setup"), this);

function onLoad() {
  hookupReturnKey(E("realName"), function() {
    E("emailAddress").focus();
  });
  hookupReturnKey(E("emailAddress"), function() {
    E("password").focus();
  });
  hookupReturnKey(E("password"), function() {
    ok();
  });
}

function ok() {
  errorShow(false);
  var checkingE = E("checking");
  checkingE.removeAttribute("hidden");
  resizeWindow();
  var emailAddress = E("emailAddress").value;
  var password = E("password").value;

  makeNewAccount(emailAddress, function(account) {
    account.setPassword(password);
    account.login(true, function() {
      window.close();
    }, errorShow);
  }, errorShow);
}

function errorShow(e) {
  var errorE = E("error");
  if (e) {
    errorE.removeAttribute("hidden");
    errorE.textContent = e + "";
  } else {
    errorE.setAttribute("hidden", "true");
  }
  resizeWindow();
}
