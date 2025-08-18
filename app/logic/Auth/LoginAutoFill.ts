import type { Account } from "../Abstract/Account";

export function autoFillLoginPage(account: Account) {
  return `(${autoFillPageScript})(${JSON.stringify(account.username ?? "")}, ${JSON.stringify(account.password ?? "")})`;
}

/** This script will be exported as string and executed within the login page.
 * Never run it here in frontend. */
function autoFillPageScript(username, password) {
  function waitForMutation() {
    let observer = new MutationObserver(function (mutations) {
      observer.disconnect();
      // Wait for mutations to finish before rechecking for widgets.
      setTimeout(checkForWidgets, 100);
    });
    observer.observe(document.body, { subtree: true, childList: true });
  }

  function checkForWidgets() {
    // Hotmail sometimes uses submit buttons.
    let inputs = [...document.querySelectorAll("input, button")].filter(input => input.checkVisibility()) as (HTMLInputElement | HTMLButtonElement)[];
    let user = inputs.filter(input => input.type == "text" || input.type == "email");
    let pass = inputs.filter(input => input.type == "password");
    let submit = inputs.filter(input => input.type == "submit");
    let button = inputs.filter(input => input.type == "button");
    let accept = document.getElementById("acceptButton");
    let decline = document.getElementById("declineButton");

    switch (sessionStorage.getItem("AutoLoginStep")) {
      // New login attempt, no step saved yet.
      case null:
        // Maybe we're trying to sign in to a personal account.
        for (let link of document.links) {
          if (link.dataset.m) {
            try {
              if (JSON.parse(link.dataset.m).cN == "SIGNIN") {
                sessionStorage.setItem("AutoLoginStep", "OtherUser");
                link.click();
                return;
              }
            } catch (ex) {
              console.error(ex);
            }
          }
        }
        // No sign in link? Fall through to try the "Other User" element.

      case "OtherUser":
        let otherTile = document.getElementById("otherTile");
        if (otherTile) {
          sessionStorage.setItem("AutoLoginStep", "Username");
          otherTile.click();
          // This click doesn't load a new page. Instead,
          // the form to input the user name is created by script.
          waitForMutation();
          return;
        }
        // No "Other User" element? Fall through to try the username.

      case "Username":
        if (user.length == 1 && pass.length == 1 && submit.length == 1 &&
           document.activeElement == user[0]) {
          // The page is prompting us for the email address.
          sessionStorage.setItem("AutoLoginStep", "Password");
          user[0].value = username;
          user[0].dispatchEvent(new Event("change"));
          pass[0].value = password;
          pass[0].dispatchEvent(new Event("change"));
          submit[0].focus();
          submit[0].click();
          // This click doesn't load a new page. Instead,
          // the form to input the password is manipulated by script.
          waitForMutation();
          return;
        }

      // Try the password
      case "Password":
        // Office 365 keeps the user input, Hotmail does not.
        if (user.length <= 1 && pass.length == 1 && submit.length == 1 &&
          document.activeElement == pass[0]) {
          // The page is prompting us for the password.
          sessionStorage.setItem("AutoLoginStep", "CheckPassword");
          // Hotmail: "[x] Keep me signed in" (may be obsolete)
          let keep = inputs.filter(input => input.type == "checkbox") as HTMLInputElement[];
          if (keep.length == 1 && keep[0].name == "KMSI" && !keep[0].checked) {
            keep[0].click();
          }
          // Simply setting the value does not work for Hotmail,
          // apparently because it overwrites the value setter.
          // Call the original one from the prototype instead.
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(pass[0], password);
          pass[0].dispatchEvent(new Event("change", { bubbles: true }));
          submit[0].focus();
          submit[0].click();
          return;
        }

      case "CheckPassword":
        let passwordError = document.getElementById("passwordError");
        let passwordErrorMessage = passwordError && passwordError.textContent.trim();
        if (passwordErrorMessage) {
          sessionStorage.setItem("AutoLoginStep", "PasswordError");
          // TODO Notify the UI in some way
          return;
        }

      // Try the "Stay signed in" prompt
      case "StaySignedIn":
        if (user.length == 0 && pass.length == 0 && submit.length == 1 &&
           button.length == 1 && button[0].value) {
          // The page is prompting us to stay logged in.
          sessionStorage.setItem("AutoLoginStep", "Complete");
          // submit = yes, button = no
          submit[0].focus();
          submit[0].click();
          return;
        } else if (accept && decline) {
          // The page is prompting us to stay logged in.
          sessionStorage.setItem("AutoLoginStep", "Complete");
          accept.focus();
          accept.click();
          return;
        } else {
          // Page might not be ready yet. Try again after the DOM has updated.
          waitForMutation();
        }
        break;

      case "PasswordError":
        return; // Mute. Let user handle it.

      case "Complete":
        break; // nothing to do here
    }
  };

  checkForWidgets();
}
