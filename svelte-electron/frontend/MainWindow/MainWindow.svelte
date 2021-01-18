<script>
  import { remote } from "electron";
  import appModulePath from "app-module-path";
  appModulePath.addPath(remote.getGlobal("__base"));
  import { onMount } from "electron";

  var gAccountListE;
  var gFolderListE;
  var gMessageListE;

  onMount(async () => {
    try {
      gAccountListE = new Fastlist(E("account-list"));
      gFolderListE = new Fastlist(E("folder-list"));
      gMessageListE = new Fastlist(E("message-list"));

      gAccountSelectionObserver.onSelectedItem(null);
      gFolderSelectionObserver.onSelectedItem(null);
      var gAccounts = remote.getGlobal("accounts");
      gAccountListE.showCollection(gAccounts);
      gAccountListE.selectedCollection.registerObserver(gAccountSelectionObserver);
      gFolderListE.selectedCollection.registerObserver(gFolderSelectionObserver);
      gMessageListE.selectedCollection.registerObserver(gMessageSelectionObserver);

      gMessageListE.filldate = getDateString;

      for (let account of gAccounts.contents) {
        if (await account.haveStoredLogin()) {
          try {
            await account.login();
            await account.inbox.fetch();
          } catch (e) { pollError(e); }
        }
      }
    } catch (e) { showError(e); }
  });

  var gAccountSelectionObserver = new SingleSelectionObserver();
  gAccountSelectionObserver.onSelectedItem = function(account) {
    gFolderListE.showCollection(account ? account.folders : new ArrayColl());
  };

  var gFolderSelectionObserver = new SingleSelectionObserver();
  gFolderSelectionObserver.onSelectedItem = async function(folder) {
    gMessageListE.showCollection(folder ? folder.messages : new ArrayColl());
    if (folder) {
      await folder.fetch();
    }
  };

  var gMessageSelectionObserver = new SingleSelectionObserver();
  gMessageSelectionObserver.onSelectedItem = function(message) {
    if (message) {
      showMessage(message);
    } else {
      // show start page
    }
  };

  function addAccount() {
    try {
      openWindow("../setup/mail-account-setup.html");
    } catch (e) { showError(e); }
  }
  window.addAccount = addAccount;

  function showError(e) {
    console.error(e);
    alert(e.message);
  }

  function pollError(e) {
    console.error(e);
  }

  function backgroundError(e) {
    console.error(e);
  }

  /**
  * This is an overly simplistic function to show the basic contents of
  * an email.
  * @param message {EMail}
  */
  function showMessage(message) {
    // Header
    E("msg-from").textContent = message.authorRealname;
    E("msg-subject").textContent = message.subject;
    E("msg-date").textContent = getDateString(message.date);

    // Body
    E("msg-body-plaintext").textContent = "";
    (async () => {
      E("msg-body-plaintext").textContent = await message.bodyPlaintext();
    })();

    // Mark as read
    message.markAsRead(true).catch(backgroundError);
  }

  /**
  * Returns:
  * For today: Time, e.g. "15:23"
  * This week: Weekday, Time, e.g. "Wed 15:23"
  * Other this year: Date without year and time, e.g. "23.11. 15:23"
  * Other: Date and time, e.g. "23.11.2018 15:23"
  * Each in locale
  * See also <https://momentjs.com> for relative time
  */
  function getDateString(date) {
    let day = getDay(date);
    var dateDetails = null;
    let today = getDay();
    if (day == today) {
      dateDetails = { hour: "numeric", minute: "numeric" };
    } else if (today - day < 7 * 24 * 60 * 60 * 1000) { // this week
      dateDetails = { weekday: "narrow", hour: "numeric", minute: "numeric" };
    } else if (day.getFullYear() == today.getFullYear()) { // this year
      dateDetails = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };
    } else {
      dateDetails = { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };
    }
    return date.toLocaleString(navigator.language, dateDetails);
  }

  function getDay(date) {
    let day = new Date(date);
    day.setHours(0);
    day.setMinutes(0);
    day.setSeconds(0);
    day.setMilliseconds(0);
    return day;
  }
</script>

<vbox  id="entire-window">
  <hbox id="menubar">
  </hbox>
  <hbox id="toolbar">
    <button onclick="addAccount()">Add account</button>
    <button onclick="newEmail()">Write</button>
    <button onclick="openAddressBook()">Address book</button>
  </hbox>
  <hbox id="window-content-pane" flex="1">
    <vbox id="left-pane" flex="1">
      <vbox id="account-pane" flex="1">
        <fastlist id="account-list">
          <header>
            <div>Accounts</div>
          </header>
          <row rowheight="20">
            <div field="emailAddress"></div>
          </row>
        </fastlist>
      </vbox>
      <vbox id="folder-pane" flex="4">
        <fastlist id="folder-list">
          <header>
            <div>Folders</div>
          </header>
          <row rowheight="20">
            <div field="name"></div>
          </row>
        </fastlist>
      </vbox>
    </vbox>
    <vbox id="right-pane" flex="4">
      <vbox id="thread-pane" flex="1">
        <fastlist id="message-list">
          <header>
            <div>From</div>
            <div>To</div>
            <div>Subject</div>
            <div>Date</div>
          </header>
          <row rowheight="20">
            <div field="authorRealname"></div>
            <div field="to"></div>
            <div field="subject"></div>
            <div field="date"></div>
          </row>
        </fastlist>
      </vbox>
      <vbox id="message-pane" flex="2">
        <!-- TODO: Move to separate source file, using overlay. -->
        <!-- TODO: Use CSS grid -->
        <vbox id="header-pane">
          <hbox><label control="msg-subject">Subject:</label><span id="msg-subject"></span></hbox>
          <hbox><label control="msg-from">From:</label><span id="msg-from"></span></hbox>
          <hbox><label control="msg-date">Date:</label><span id="msg-date"></span></hbox>
        </vbox>
        <vbox id="msg-body-box" flex="1">
          <div id="msg-body-plaintext">
          </div>
          <iframe id="msg-body-frame" flex="1">
          </iframe>
        </vbox>
      </vbox>
    </vbox>
  </hbox>
  <hbox id="statusbar">
  </hbox>
</vbox>

<style>
  #entire-window {
    flex: 1;
    height: 100%;
  }
  #window-content-pane {
    flex: 1;
    overflow: hidden;
  }
  #left-pane {
    flex: 1;
    min-width: 200px;
  }
  #right-pane {
    flex: 4;
    min-width: 300px;
  }
  #account-pane {
    flex: 1;
  }
  #folder-pane {
    flex: 4;
  }
  #thread-pane {
    flex: 1;
    overflow: hidden;
  }
  #message-list {
    overflow: hidden;
  }
  #message-pane {
    flex: 2;
    overflow: auto;
  }
  #account-list, #folder-list, #message-list, #msg-body-box {
    flex: 1;
  }
  #header-pane {
    border: 1px solid #8E8EA1;
    background-color: #EEF3F9;
    padding: 3px;
  }
  #header-pane label {
    margin-right: 0.3em;
  }
  #msg-body-box {
    margin-top: 5px;
  }
  #msg-body-plaintext {
    white-space: pre-wrap;
    padding: 1em;
  }
  #msg-body-frame {
    display: none;
  }
</style>
