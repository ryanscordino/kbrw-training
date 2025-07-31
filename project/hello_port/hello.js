var NodeErlastic = require("@kbrw/node_erlastic");

NodeErlastic.server(function (term, from, state, done) {
  NodeErlastic.log("Received term: " + JSON.stringify(term));
  NodeErlastic.log("Current state: " + JSON.stringify(state));

  // Init
  if (!Array.isArray(state)) {
    state = [];
  }

  // Handle hello command (from Step 0 requirement)
  if (term == "hello") {
    return done("reply", "Hello world!");
  }

  // Handle get command - return all accumulated messages
  if (term == "get") {
    return done("reply", state);
  }

  // Handle add_kv command - check for tuple structure from node_erlastic
  if (
    term &&
    term.type === "Tuple" &&
    term.length === 2 &&
    term[0] &&
    term[0].type === "Atom" &&
    term[0].value === "add_kv"
  ) {
    var kvPair = term[1]; // This is the {key, value} tuple
    var newState = [...state, kvPair];
    NodeErlastic.log(
      "Adding key-value: " +
        JSON.stringify(kvPair) +
        " to state. New state: " +
        JSON.stringify(newState)
    );
    return done("noreply", newState);
  }

  // Handle add_msg command - check for tuple structure from node_erlastic
  if (
    term &&
    term.type === "Tuple" &&
    term.length === 2 &&
    term[0] &&
    term[0].type === "Atom" &&
    term[0].value === "add_msg"
  ) {
    NodeErlastic.log(JSON.stringify(term));
    var message = term[1]; // This is the message
    var newState = [...state, message];
    NodeErlastic.log(
      "Adding message: " +
        JSON.stringify(message) +
        " to state. New state: " +
        JSON.stringify(newState)
    );
    return done("noreply", newState);
  }

  // Unknown command
  NodeErlastic.log("Unknown command: " + JSON.stringify(term));
  throw new Error("Unexpected request: " + JSON.stringify(term));
});
