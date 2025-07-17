var createReactClass = require("create-react-class");
var ReactDOM = require("react-dom");
var React = require("react");

var Page = createReactClass({
  render() {
    return (
      <JSXZ in="webflow/template" sel=".container">
        <Z sel=".item">Burgers</Z>
        <Z sel=".price">50</Z>
      </JSXZ>
    );
  },
});

ReactDOM.render(<Page />, document.getElementById("root"));
