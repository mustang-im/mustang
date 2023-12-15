require("babel-register");

const MainWindow = require("../mainwin/MainWindow");
const ReactDOM = require("react-dom");
const React = require("react");

ReactDOM.render(React.createElement(MainWindow), document.body);
