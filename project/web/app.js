require("!!file-loader?name=[name].[ext]!./index.html");
/* required library for our React app */
var ReactDOM = require("react-dom");
var React = require("react");
var createReactClass = require("create-react-class");

/* required css for our application */
require("./webflow/styles.css");
require("./webflow/modal-loading.css");

var Qs = require("qs");
var Cookie = require("cookie");

var XMLHttpRequest = require("xhr2");
var HTTP = new (function () {
  this.get = (url) => this.req("GET", url);
  this.delete = (url) => this.req("DELETE", url);
  this.post = (url, data) => this.req("POST", url, data);
  this.put = (url, data) => this.req("PUT", url, data);

  this.req = (method, url, data) =>
    new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();
      req.open(method, url);
      req.responseType = "text";
      req.setRequestHeader("accept", "application/json,*/*;0.8");
      req.setRequestHeader("content-type", "application/json");
      req.onload = () => {
        if (req.status >= 200 && req.status < 300) {
          resolve(req.responseText && JSON.parse(req.responseText));
        } else {
          reject({ http_code: req.status });
        }
      };
      req.onerror = (err) => {
        reject({ http_code: req.status });
      };
      req.send(data && JSON.stringify(data));
    });
})();

// Helper function to change page
var GoTo = (route, params, query) => {
  console.log("GoTo");
  var qs = Qs.stringify(query);
  var url = routes[route].path(params) + (qs == "" ? "" : "?" + qs);
  console.log("Changing URL to", url);
  history.pushState({}, "", url);
  onPathChange();
};

/**
 * `remoteProps` are list of functions that map the props from `BrowserState.handlerPath` indicated [here](https://github.com/vuthanhtung2412/formation-kbrw/blob/809acd75e0c1b3a2e0b1c66a9d7891ce9a36fe72/realisation/rest/web/app.js#L208-L211)
 * to `{url : string, prop: string}` which can be used to fetch data
 * with [`HTTP`](https://github.com/vuthanhtung2412/formation-kbrw/blob/main/realisation/rest/web/app.js#L18-L18)
 */
var remoteProps = {
  // Example of how to implement auth mechanism
  // user: (props)=>{
  //   return {
  //     url: "/api/me",
  //     prop: "user"
  //   }
  // },

  // props = {qs: QueryString, ...pathParams: Record<string,string>}
  orders: (props) => {
    // Example of how to implement auth mechanism
    // if(!props.user)
    //   return

    // qs stands for query string
    var qs = {
      ...props.qs,
      // user_id: props.user.value.id
    };

    // Make sure search query is included
    if (props.qs.q) {
      qs.q = props.qs.q;
    }

    var query = Qs.stringify(qs);
    return {
      url: "/api/orders" + (query == "" ? "" : "?" + query),
      prop: "orders",
    };
  },
  order: (props) => {
    return {
      url: "/api/order/" + props.order_id,
      prop: "order",
    };
  },
};

var routes = {
  orders: {
    path: (params) => {
      return "/";
    },
    match: (path, qs) => {
      return path == "/" && { handlerPath: [Layout, Header, Orders] }; // Note that we use the "&&" expression to simulate a IF statement
    },
  },
  order: {
    path: (params) => {
      return "/order/" + params;
    },
    match: (path, qs) => {
      var r = new RegExp("/order/([^/]*)$").exec(path);
      return r && { handlerPath: [Layout, Header, Order], order_id: r[1] }; // Note that we use the "&&" expression to simulate a IF statement
    },
  },
};

var Child = createReactClass({
  render() {
    var [ChildHandler, ...rest] = this.props.handlerPath;
    return <ChildHandler {...this.props} handlerPath={rest} />;
  },
});

var cn = function () {
  var args = arguments,
    classes = {};
  for (var i in args) {
    var arg = args[i];
    if (!arg) continue;
    if ("string" === typeof arg || "number" === typeof arg) {
      arg
        .split(" ")
        .filter((c) => c != "")
        .map((c) => {
          classes[c] = true;
        });
    } else if ("object" === typeof arg) {
      for (var key in arg) classes[key] = arg[key];
    }
  }
  return Object.keys(classes)
    .map((k) => (classes[k] && k) || "")
    .join(" ");
};

var Layout = createReactClass({
  getInitialState: function () {
    return {
      modal: null,
      loader: null,
    };
  },
  modal(spec) {
    this.setState({
      modal: {
        ...spec,
        callback: (res) => {
          this.setState({ modal: null }, () => {
            if (spec.callback) spec.callback(res);
          });
        },
      },
    });
  },
  loader() {
    const callback = () => {
      this.setState({ loader: null });
    };
    this.setState({
      loader: {
        callback,
      },
    });
    return callback;
  },
  render() {
    console.log("Rendering Layout");
    var modal_component = {
      delete: (props) => <DeleteModal {...props} />,
    }[this.state.modal && this.state.modal.type];
    modal_component = modal_component && modal_component(this.state.modal);
    var props = {
      ...this.props,
      modal: this.modal,
      loader: this.loader,
    };
    return (
      <JSXZ in="orders" sel=".root">
        <Z sel=".layout-container">
          <Child {...props} />
          {/* <this.props.Child {...this.props} /> */}
          <JSXZ
            in="modal"
            sel=".modal-wrapper"
            className={cn(classNameZ, { hidden: !modal_component })}
          >
            {modal_component}
          </JSXZ>
          <JSXZ
            in="loader"
            sel=".loader-container"
            className={cn(classNameZ, { hidden: !this.state.loader })}
          >
            <h1>LOADING...</h1>
          </JSXZ>
        </Z>
      </JSXZ>
    );
  },
});

var Header = createReactClass({
  getInitialState() {
    return {
      searchQuery: this.props.qs.q || "",
    };
  },
  handleSearchSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get("search") || "*:*";

    GoTo("orders", "", {
      ...this.props.qs,
      q: searchQuery,
      page: 0, // Reset to first page when searching
    });
  },
  render() {
    console.log("Start header");
    return (
      <JSXZ in="orders" sel=".header-container">
        <Z sel=".heading-div-with-search">
          <ChildrenZ />
          <JSXZ in="orders" sel=".search-div">
            <Z sel=".search" onSubmit={(e) => this.handleSearchSubmit(e)}></Z>
          </JSXZ>
        </Z>
        <Z sel=".body-div">
          <Child {...this.props} />
        </Z>
      </JSXZ>
    );
  },
});

var DeleteModal = createReactClass({
  render() {
    return (
      <JSXZ in="modal" sel=".modal-content">
        <p>{this.props.title}</p>
        <p>{this.props.message}</p>
        <button
          onClick={() => {
            this.props.callback(true);
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => {
            this.props.callback(false);
          }}
        >
          Cancel
        </button>
      </JSXZ>
    );
  },
});

var Orders = createReactClass({
  // `statics`` lets you define static methods, field that belong to the component itself, not its instances.
  statics: {
    remoteProps: [remoteProps.orders],
  },
  render() {
    console.log("Start orders");
    console.dir(this.props, { depth: null });
    console.dir(this.props.orders.value, { depth: null });
    return (
      <JSXZ in="orders" sel=".body-div">
        <Z sel=".table">
          <JSXZ in="orders" sel=".table-header">
            <ChildrenZ />
          </JSXZ>
          <JSXZ in="orders" sel=".table-body">
            {this.props.orders.value.orders.value.map((order) => {
              const custom = order.custom;
              const billing_address = custom.billing_address;
              const payment = custom.magento.payment;
              return (
                <JSXZ in="orders" sel=".table-row" key={order.id}>
                  <Z sel=".div-body-table .id">{order.remoteid}</Z>
                  <Z sel=".div-body-table .name">{custom.customer.full_name}</Z>
                  <Z sel=".div-body-table .address">
                    {`${billing_address.street[0]}, 
                    ${billing_address.city}, 
                    ${billing_address.postcode}, 
                    ${billing_address.country_id}`}
                  </Z>
                  <Z sel=".div-body-table .quantity">{custom.items.length}</Z>
                  <Z
                    in="orders"
                    sel=".div-body-table .button-detail"
                    onClick={() => {
                      GoTo("order", order.id);
                    }}
                  >
                    
                  </Z>
                  <Z in="orders" sel=".div-body-table .button-pay"></Z>
                  <Z in="orders" sel=".div-block-6 .tag-status">
                    {payment.account_status ? payment.account_status : "Null"}
                  </Z>
                  <Z in="orders" sel=".div-block-6 .tag-delivery">
                    {payment.additional_information[1]}
                  </Z>
                  <Z
                    in="orders"
                    sel=".button-delete"
                    onClick={() => {
                      console.log("Delete order", order.id);
                      this.props.modal({
                        type: "delete",
                        title: "Order deletion",
                        message: `Are you sure you want to delete order ${order.id} ?`,
                        callback: (value) => {
                          if (value) {
                            // Start the loader and HTTP request immediately
                            const loader_callback = this.props.loader();
                            HTTP.delete(`/api/order/${order.id}`)
                              .then((_) => {
                                reload("orders");
                                console.log(`Order ${order.id} deleted`);
                              })
                              .catch((err) => {
                                alert("Deletion fails");
                              })
                              .finally(() => {
                                loader_callback();
                              });
                            return;
                          }
                          console.log(`Order ${order.id} deletion cancelled`);
                        },
                      });
                    }}
                  >
                    delete
                  </Z>
                </JSXZ>
              );
            })}
          </JSXZ>
        </Z>
        <ChildrenZ />
        <Z
          sel=".back"
          onClick={() => {
            console.log("Go back to orders");
            if (this.props.qs.page && Number(this.props.qs.page)) {
              GoTo("orders", "", {
                ...this.props.qs,
                page: Number(this.props.qs.page) - 1,
              });
            } else {
              console.log("No previous page");
            }
          }}
        >
          <ChildrenZ />
        </Z>
        <Z sel=".curr">{Number(this.props.qs.page || "0")}</Z>
        <Z
          sel=".forward"
          onClick={() => {
            console.log("next page");
            GoTo("orders", "", {
              ...this.props.qs,
              page: Number(this.props.qs.page || "0") + 1,
            });
          }}
        >
          <ChildrenZ />
        </Z>
      </JSXZ>
    );
  },
});

var Order = createReactClass({
  statics: {
    remoteProps: [remoteProps.order],
  },
  render() {
    console.log("Order props");
    const order = this.props.order.value;
    console.dir(order, { depth: null });
    const custom = order.custom;
    return (
      <JSXZ in="order-detail" sel=".body-div">
        <Z sel=".order-id">{order.remoteid}</Z>
        <Z sel=".name">{order.custom.customer.full_name}</Z>
        <Z sel=".address">
          {`${custom.billing_address.street[0]}, 
          ${custom.billing_address.city}, 
          ${custom.billing_address.postcode}, 
          ${custom.billing_address.country_id}`}
        </Z>
        <Z sel=".number">{order.remoteid}</Z>
        <Z sel=".table">
          <JSXZ in="order-detail" sel=".order-row"></JSXZ>
          {custom.items.map((item) => {
            return (
              <JSXZ in="order-detail" sel=".order-row" key={item.item_id}>
                <Z sel=".product-name">{item.product_title}</Z>
                <Z sel=".product-quantity">{item.quantity_to_fetch}</Z>
                <Z sel=".product-price">{item.price}</Z>
                <Z sel=".product-total">
                  {item.price * item.quantity_to_fetch}
                </Z>
              </JSXZ>
            );
          })}
        </Z>
        <Z
          sel=".button-back"
          onClick={() => {
            console.log("Go back to orders");
            history.back();
          }}
        ></Z>
      </JSXZ>
    );
  },
});

var ErrorPage = createReactClass({
  render() {
    return (
      <h1>
        {this.props.message} {this.props.error}
      </h1>
    );
  },
});

/**
 * `browserState` gonna be passed as parameter in `addRemoteProps`
 * `addRemoteProps` modifies it to add the data from the API.
 * the result of the API will be stored in a key with value of `remoteProp.prop`
 * [ref](https://github.com/vuthanhtung2412/formation-kbrw/blob/809acd75e0c1b3a2e0b1c66a9d7891ce9a36fe72/realisation/rest/web/app.js#L80-L80)
 */
function addRemoteProps(props) {
  return new Promise((resolve, reject) => {
    console.log("Adding remote props");
    var remoteProps = Array.prototype.concat.apply(
      [],
      props.handlerPath
        // Orders.remoteProps = remoteProps.orders
        .map((c) => c.remoteProps) // -> [[remoteProps.orders], null]
        .filter((p) => p) // -> [[remoteProps.orders]]
    );
    // Eventually, this produce (({qs: QueryString, ...pathParams: Record<string,string>}) => {url: string, prop: string})[]

    remoteProps = remoteProps
      .map((spec_fun) => spec_fun(props)) // [{url: '/api/orders', prop: 'orders'}]
      .filter((specs) => specs) // get rid of undefined from remoteProps that don't match their dependencies
      .filter(
        (specs) => !props[specs.prop] || props[specs.prop].url != specs.url
      ); // get rid of remoteProps already resolved with the url

    // If now new remotePorps to fetch, we resolve the promise with the current props
    if (remoteProps.length == 0) return resolve(props);

    const promise_mapper = (spec) => {
      // we want to keep the url in the value resolved by the promise here : spec = {url: '/api/orders', value: ORDERS, prop: 'orders'}
      return HTTP.get(spec.url).then((res) => {
        spec.value = res;
        return spec;
      });
    };

    const reducer = (acc, spec) => {
      // spec = {url: '/api/orders', value: ORDERS, prop: 'user'}
      acc[spec.prop] = { url: spec.url, value: spec.value };
      return acc;
    };

    const promise_array = remoteProps.map(promise_mapper);
    return Promise.all(promise_array)
      .then((xs) => xs.reduce(reducer, props), reject)
      .then((p) => {
        // recursively call remote props, because props computed from
        // previous queries can give the missing data/props necessary
        // to define another query
        return addRemoteProps(p).then(resolve, reject);
      }, reject);
  });
}

var browserState = {};
function onPathChange() {
  var path = location.pathname;
  var qs = Qs.parse(location.search.slice(1));
  console.log("query string");
  console.dir(qs, { depth: null });
  var cookies = Cookie.parse(document.cookie);

  browserState = {
    ...browserState,
    path: path,
    qs: qs,
    cookie: cookies,
  };

  var route;

  // We try to match the requested path to one our our routes
  for (var key in routes) {
    routeProps = routes[key].match(path, qs);
    if (routeProps) {
      route = key;
      console.log("routeProps");
      console.dir(routeProps, { depth: null });
      break;
    }
  }

  // We add the route name and the route Props to the global browserState
  browserState = {
    ...browserState,
    ...routeProps,
    route: route,
  };
  console.log("browserState:");
  console.dir(browserState, { depth: null });

  // If the path in the URL doesn't match with any of our routes, we render an Error component (we will have to create it later)
  if (!route)
    return ReactDOM.render(
      <ErrorPage message={"Not Found"} code={404} />,
      document.getElementById("root")
    );

  addRemoteProps(browserState).then(
    (props) => {
      browserState = props;
      // Log our new browserState
      console.log(browserState);
      // Render our components using our remote data
      ReactDOM.render(
        <Child {...browserState} />,
        document.getElementById("root")
      );
    },
    (res) => {
      ReactDOM.render(
        <ErrorPage message={"Shit happened"} code={res.http_code} />,
        document.getElementById("root")
      );
    }
  );
}

function reload(remoteProp) {
  console.log(`Reload remote prop ${remoteProp}`);
  delete browserState[remoteProp];
  addRemoteProps(browserState).then(
    (props) => {
      browserState = props;
      // Log our new browserState
      console.log(browserState);
      // Render our components using our remote data
      ReactDOM.render(
        <Child {...browserState} />,
        document.getElementById("root")
      );
    },
    (res) => {
      ReactDOM.render(
        <ErrorPage message={"Something happened"} code={res.http_code} />,
        document.getElementById("root")
      );
    }
  );
}

window.addEventListener("popstate", () => {
  onPathChange();
});
onPathChange();
