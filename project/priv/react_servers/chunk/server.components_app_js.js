exports.id = "components_app_js";
exports.ids = ["components_app_js"];
exports.modules = {

/***/ "./components/app.js":
/*!***************************!*\
  !*** ./components/app.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '!!file-loader?name=[name].[ext]!./index.html'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
/* required library for our React app */
var ReactDOM = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
var React = __webpack_require__(/*! react */ "./node_modules/react/index.js");
var createReactClass = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");

/* required css for our application */
__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '../webflow/styles.css'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '../webflow/modal-loading.css'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var Qs = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
var Cookie = __webpack_require__(/*! cookie */ "./node_modules/cookie/index.js");
var XMLHttpRequest = __webpack_require__(/*! xhr2 */ "./node_modules/xhr2/lib/xhr2.js");
var HTTP = new function () {
  this.get = url => this.req("GET", url);
  this.delete = url => this.req("DELETE", url);
  this.post = (url, data) => this.req("POST", url, data);
  this.put = (url, data) => this.req("PUT", url, data);
  this.req = (method, url, data) => new Promise((resolve, reject) => {
    var req = new XMLHttpRequest();
    req.open(method, url);
    req.responseType = "text";
    req.setRequestHeader("accept", "application/json,*/*;0.8");
    req.setRequestHeader("content-type", "application/json");
    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        resolve(req.responseText && JSON.parse(req.responseText));
      } else {
        reject({
          http_code: req.status
        });
      }
    };
    req.onerror = err => {
      reject({
        http_code: req.status
      });
    };
    req.send(data && JSON.stringify(data));
  });
}();

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
  orders: props => {
    // Example of how to implement auth mechanism
    // if(!props.user)
    //   return

    // qs stands for query string
    var qs = {
      ...props.qs
      // user_id: props.user.value.id
    };

    // Make sure search query is included
    if (props.qs.q) {
      qs.q = props.qs.q;
    }
    var query = Qs.stringify(qs);
    return {
      url: "/api/orders" + (query == "" ? "" : "?" + query),
      prop: "orders"
    };
  },
  order: props => {
    return {
      url: "/api/order/" + props.order_id,
      prop: "order"
    };
  }
};
var routes = {
  orders: {
    path: params => {
      return "/";
    },
    match: (path, qs) => {
      return path == "/" && {
        handlerPath: [Layout, Header, Orders]
      }; // Note that we use the "&&" expression to simulate a IF statement
    }
  },
  order: {
    path: params => {
      return "/order/" + params;
    },
    match: (path, qs) => {
      var r = new RegExp("/order/([^/]*)$").exec(path);
      return r && {
        handlerPath: [Layout, Header, Order],
        order_id: r[1]
      }; // Note that we use the "&&" expression to simulate a IF statement
    }
  }
};
var Child = createReactClass({
  displayName: "Child",
  render() {
    var [ChildHandler, ...rest] = this.props.handlerPath;
    return /*#__PURE__*/React.createElement(ChildHandler, _extends({}, this.props, {
      handlerPath: rest
    }));
  }
});
var cn = function () {
  var args = arguments,
    classes = {};
  for (var i in args) {
    var arg = args[i];
    if (!arg) continue;
    if ("string" === typeof arg || "number" === typeof arg) {
      arg.split(" ").filter(c => c != "").map(c => {
        classes[c] = true;
      });
    } else if ("object" === typeof arg) {
      for (var key in arg) classes[key] = arg[key];
    }
  }
  return Object.keys(classes).map(k => classes[k] && k || "").join(" ");
};
var Layout = createReactClass({
  displayName: "Layout",
  getInitialState: function () {
    return {
      modal: null,
      loader: null
    };
  },
  modal(spec) {
    this.setState({
      modal: {
        ...spec,
        callback: res => {
          this.setState({
            modal: null
          }, () => {
            if (spec.callback) spec.callback(res);
          });
        }
      }
    });
  },
  loader() {
    const callback = () => {
      this.setState({
        loader: null
      });
    };
    this.setState({
      loader: {
        callback
      }
    });
    return callback;
  },
  render() {
    console.log("Rendering Layout");
    var modal_component = {
      delete: props => /*#__PURE__*/React.createElement(DeleteModal, props)
    }[this.state.modal && this.state.modal.type];
    modal_component = modal_component && modal_component(this.state.modal);
    var props = {
      ...this.props,
      modal: this.modal,
      loader: this.loader
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "root"
    }, /*#__PURE__*/React.createElement("div", {
      className: "layout-container"
    }, /*#__PURE__*/React.createElement(Child, props), /*#__PURE__*/React.createElement("div", {
      className: cn("modal-wrapper", {
        hidden: !modal_component
      })
    }, modal_component), /*#__PURE__*/React.createElement("div", {
      className: cn("loader-container", {
        hidden: !this.state.loader
      })
    }, /*#__PURE__*/React.createElement("h1", null, "LOADING..."))));
  }
});
var Header = createReactClass({
  displayName: "Header",
  getInitialState() {
    return {
      searchQuery: this.props.qs.q || ""
    };
  },
  handleSearchSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get("search") || "*:*";
    GoTo("orders", "", {
      ...this.props.qs,
      q: searchQuery,
      page: 0 // Reset to first page when searching
    });
  },
  render() {
    console.log("Start header");
    return /*#__PURE__*/React.createElement("div", {
      className: "header-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "heading-div-with-search"
    }, /*#__PURE__*/React.createElement("div", {
      className: "heading-div"
    }, /*#__PURE__*/React.createElement("a", {
      href: "/",
      style: {
        textDecoration: "none"
      }
    }, /*#__PURE__*/React.createElement("h1", {
      className: "heading"
    }, "ORDERS")), /*#__PURE__*/React.createElement("div", {
      className: "login-block"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "button-outlined button-sign-in w-button"
    }, "Sign In"), /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "button button-sign-up w-button"
    }, "Sign Up"))), /*#__PURE__*/React.createElement("div", {
      className: "search-div"
    }, /*#__PURE__*/React.createElement("form", {
      action: "/",
      className: "search w-form"
    }, /*#__PURE__*/React.createElement("input", {
      className: "search-header w-input",
      maxLength: 256,
      name: "search",
      placeholder: "20161698445, Jean Luc, Paris...",
      type: "search",
      id: "search",
      required: ""
    }), /*#__PURE__*/React.createElement("input", {
      type: "submit",
      className: "search-button w-button",
      defaultValue: "Search"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "search-div"
    }, /*#__PURE__*/React.createElement("form", {
      action: "/",
      className: "search w-form",
      onSubmit: e => this.handleSearchSubmit(e)
    }))), /*#__PURE__*/React.createElement("div", {
      className: "body-div"
    }, /*#__PURE__*/React.createElement(Child, this.props)));
  }
});
var DeleteModal = createReactClass({
  displayName: "DeleteModal",
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-content"
    }, /*#__PURE__*/React.createElement("p", null, this.props.title), /*#__PURE__*/React.createElement("p", null, this.props.message), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        this.props.callback(true);
      }
    }, "Confirm"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        this.props.callback(false);
      }
    }, "Cancel"));
  }
});
var Orders = createReactClass({
  displayName: "Orders",
  // `statics`` lets you define static methods, field that belong to the component itself, not its instances.
  statics: {
    remoteProps: [remoteProps.orders]
  },
  render() {
    console.log("Start orders");
    console.dir(this.props, {
      depth: null
    });
    console.dir(this.props.orders.value, {
      depth: null
    });
    return /*#__PURE__*/React.createElement("div", {
      className: "body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "table"
    }, /*#__PURE__*/React.createElement("div", {
      className: "table-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "table-header-text"
    }, "Command number"), /*#__PURE__*/React.createElement("div", {
      className: "table-header-text"
    }, "Customer"), /*#__PURE__*/React.createElement("div", {
      className: "table-header-text"
    }, "Address"), /*#__PURE__*/React.createElement("div", {
      className: "table-header-text"
    }, "Quantity"), /*#__PURE__*/React.createElement("div", {
      className: "table-header-text"
    }, "Detail"), /*#__PURE__*/React.createElement("div", {
      id: "w-node-_4011bcf9-3b62-f71c-376e-6aa385a00ed2-e5f29be1",
      className: "table-header-text"
    }, "Pay"), /*#__PURE__*/React.createElement("div", {
      id: "w-node-_4a525b14-ac1e-39c2-f187-43d5a2420722-e5f29be1",
      className: "table-header-text"
    }, "Actions")), /*#__PURE__*/React.createElement("div", {
      className: "table-body"
    }, this.props.orders.value.orders.value.map(order => {
      const custom = order.custom;
      const billing_address = custom.billing_address;
      const payment = custom.magento.payment;
      return /*#__PURE__*/React.createElement("div", {
        className: "table-row",
        key: order.id
      }, /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "table-body-text id"
      }, order.remoteid)), /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "table-body-text name"
      }, custom.customer.full_name)), /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "table-body-text address"
      }, `${billing_address.street[0]}, 
                    ${billing_address.city}, 
                    ${billing_address.postcode}, 
                    ${billing_address.country_id}`)), /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tag-gray quantity"
      }, custom.items.length)), /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("a", {
        href: "#",
        className: "button-arrow button-detail w-button",
        in: "orders",
        onClick: () => {
          GoTo("order", order.id);
        }
      }, "\uF061")), /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("a", {
        href: "#",
        className: "button-arrow button-pay w-button",
        in: "orders"
      }), /*#__PURE__*/React.createElement("div", {
        className: "div-block-6"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-block-4"
      }, "Status:"), /*#__PURE__*/React.createElement("div", {
        className: "tag-orange tag-status",
        in: "orders"
      }, payment.account_status ? payment.account_status : "Null")), /*#__PURE__*/React.createElement("div", {
        className: "div-block-6"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-block-4"
      }, "Pay.method:"), /*#__PURE__*/React.createElement("div", {
        className: "tag-gray tag-delivery",
        in: "orders"
      }, payment.additional_information[1]))), /*#__PURE__*/React.createElement("a", {
        href: "#",
        className: "button-delete w-button",
        in: "orders",
        onClick: () => {
          console.log("Delete order", order.id);
          this.props.modal({
            type: "delete",
            title: "Order deletion",
            message: `Are you sure you want to delete order ${order.id} ?`,
            callback: value => {
              if (value) {
                // Start the loader and HTTP request immediately
                const loader_callback = this.props.loader();
                HTTP.delete(`/api/order/${order.id}`).then(_ => {
                  reload("orders");
                  console.log(`Order ${order.id} deleted`);
                }).catch(err => {
                  alert("Deletion fails");
                }).finally(() => {
                  loader_callback();
                });
                return;
              }
              console.log(`Order ${order.id} deletion cancelled`);
            }
          });
        }
      }, "delete"));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "pagination-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pagination-div p-back"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "button-nav w-button back",
      onClick: () => {
        console.log("Go back to orders");
        if (this.props.qs.page && Number(this.props.qs.page)) {
          GoTo("orders", "", {
            ...this.props.qs,
            page: Number(this.props.qs.page) - 1
          });
        } else {
          console.log("No previous page");
        }
      }
    }, "\uF060")), /*#__PURE__*/React.createElement("div", {
      className: "pagination-div p-curr"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "button-nav-number w-button curr"
    }, Number(this.props.qs.page || "0"))), /*#__PURE__*/React.createElement("div", {
      className: "pagination-div p-forward"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "button-nav w-button forward",
      onClick: () => {
        console.log("next page");
        GoTo("orders", "", {
          ...this.props.qs,
          page: Number(this.props.qs.page || "0") + 1
        });
      }
    }, "\uF061"))));
  }
});
var Order = createReactClass({
  displayName: "Order",
  statics: {
    remoteProps: [remoteProps.order]
  },
  render() {
    console.log("Order props");
    const order = this.props.order.value;
    console.dir(order, {
      depth: null
    });
    const custom = order.custom;
    return /*#__PURE__*/React.createElement("div", {
      className: "body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-heading-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "heading"
    }, /*#__PURE__*/React.createElement("strong", {
      className: "order-props-text-darkgray"
    }, "Order")), /*#__PURE__*/React.createElement("div", {
      className: "heading"
    }, /*#__PURE__*/React.createElement("strong", {
      className: "order-props-text-darkgray order-id"
    }, order.remoteid))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
      className: "order-props-text-darkgray"
    }, "Propri\xE9t\xE9s")), /*#__PURE__*/React.createElement("div", {
      className: "order-header-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-fa"
    }, "\uF0F2"), /*#__PURE__*/React.createElement("div", {
      className: "order-props-text-gray"
    }, "Client")), /*#__PURE__*/React.createElement("div", {
      className: "order-props-body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-text-darkgray name"
    }, order.custom.customer.full_name)), /*#__PURE__*/React.createElement("div", {
      className: "order-props-body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-fa"
    }, "\uF2B9"), /*#__PURE__*/React.createElement("div", {
      className: "order-props-text-gray"
    }, "Address")), /*#__PURE__*/React.createElement("div", {
      className: "order-props-body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-text-darkgray address"
    }, `${custom.billing_address.street[0]}, 
          ${custom.billing_address.city}, 
          ${custom.billing_address.postcode}, 
          ${custom.billing_address.country_id}`)), /*#__PURE__*/React.createElement("div", {
      className: "order-props-body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-fa"
    }, "#"), /*#__PURE__*/React.createElement("div", {
      className: "order-props-text-gray"
    }, "Command number")), /*#__PURE__*/React.createElement("div", {
      className: "order-props-body-div"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-props-text-darkgray number"
    }, order.remoteid)))), /*#__PURE__*/React.createElement("div", {
      className: "table"
    }, /*#__PURE__*/React.createElement("div", {
      className: "order-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "div-body-table"
    }, /*#__PURE__*/React.createElement("div", {
      className: "table-body-text product-name"
    }, "Pommes", /*#__PURE__*/React.createElement("br", null))), /*#__PURE__*/React.createElement("div", {
      id: "w-node-ae8ca97b-511a-4289-7d72-e2209ab4714f-26387994",
      className: "div-body-table"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tag-gray product-quantity"
    }, "3")), /*#__PURE__*/React.createElement("div", {
      id: "w-node-d69abaa5-9570-a412-ab33-f0097c9f81f4-26387994",
      className: "div-body-table"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tag-gray product-price"
    }, "1.00")), /*#__PURE__*/React.createElement("div", {
      id: "w-node-f2097018-1c8f-c06a-3620-709ab27abe1a-26387994",
      className: "div-body-table"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tag-gray product-total"
    }, "3.00"))), custom.items.map(item => {
      return /*#__PURE__*/React.createElement("div", {
        className: "order-row",
        key: item.item_id
      }, /*#__PURE__*/React.createElement("div", {
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "table-body-text product-name"
      }, item.product_title)), /*#__PURE__*/React.createElement("div", {
        id: "w-node-ae8ca97b-511a-4289-7d72-e2209ab4714f-26387994",
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tag-gray product-quantity"
      }, item.quantity_to_fetch)), /*#__PURE__*/React.createElement("div", {
        id: "w-node-d69abaa5-9570-a412-ab33-f0097c9f81f4-26387994",
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tag-gray product-price"
      }, item.price)), /*#__PURE__*/React.createElement("div", {
        id: "w-node-f2097018-1c8f-c06a-3620-709ab27abe1a-26387994",
        className: "div-body-table"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tag-gray product-total"
      }, item.price * item.quantity_to_fetch)));
    })), /*#__PURE__*/React.createElement("div", {
      className: "div-block-8"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "button-back w-button",
      onClick: () => {
        console.log("Go back to orders");
        history.back();
      }
    })));
  }
});
var ErrorPage = createReactClass({
  displayName: "ErrorPage",
  render() {
    return /*#__PURE__*/React.createElement("h1", null, this.props.message, " ", this.props.error);
  }
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
    var remoteProps = Array.prototype.concat.apply([], props.handlerPath
    // Orders.remoteProps = remoteProps.orders
    .map(c => c.remoteProps) // -> [[remoteProps.orders], null]
    .filter(p => p) // -> [[remoteProps.orders]]
    );
    // Eventually, this produce (({qs: QueryString, ...pathParams: Record<string,string>}) => {url: string, prop: string})[]

    remoteProps = remoteProps.map(spec_fun => spec_fun(props)) // [{url: '/api/orders', prop: 'orders'}]
    .filter(specs => specs) // get rid of undefined from remoteProps that don't match their dependencies
    .filter(specs => !props[specs.prop] || props[specs.prop].url != specs.url); // get rid of remoteProps already resolved with the url

    // If now new remotePorps to fetch, we resolve the promise with the current props
    if (remoteProps.length == 0) return resolve(props);
    const promise_mapper = spec => {
      // we want to keep the url in the value resolved by the promise here : spec = {url: '/api/orders', value: ORDERS, prop: 'orders'}
      return HTTP.get(spec.url).then(res => {
        spec.value = res;
        return spec;
      });
    };
    const reducer = (acc, spec) => {
      // spec = {url: '/api/orders', value: ORDERS, prop: 'user'}
      acc[spec.prop] = {
        url: spec.url,
        value: spec.value
      };
      return acc;
    };
    const promise_array = remoteProps.map(promise_mapper);
    return Promise.all(promise_array).then(xs => xs.reduce(reducer, props), reject).then(p => {
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
  console.dir(qs, {
    depth: null
  });
  var cookies = Cookie.parse(document.cookie);
  browserState = {
    ...browserState,
    path: path,
    qs: qs,
    cookie: cookies
  };
  var route;

  // We try to match the requested path to one our our routes
  for (var key in routes) {
    routeProps = routes[key].match(path, qs);
    if (routeProps) {
      route = key;
      console.log("routeProps");
      console.dir(routeProps, {
        depth: null
      });
      break;
    }
  }

  // We add the route name and the route Props to the global browserState
  browserState = {
    ...browserState,
    ...routeProps,
    route: route
  };
  console.log("browserState:");
  console.dir(browserState, {
    depth: null
  });

  // If the path in the URL doesn't match with any of our routes, we render an Error component (we will have to create it later)
  if (!route) return ReactDOM.render(/*#__PURE__*/React.createElement(ErrorPage, {
    message: "Not Found",
    code: 404
  }), document.getElementById("root"));
  addRemoteProps(browserState).then(props => {
    browserState = props;
    // Log our new browserState
    console.log(browserState);
    // Render our components using our remote data
    ReactDOM.render(/*#__PURE__*/React.createElement(Child, browserState), document.getElementById("root"));
  }, res => {
    ReactDOM.render(/*#__PURE__*/React.createElement(ErrorPage, {
      message: "Shit happened",
      code: res.http_code
    }), document.getElementById("root"));
  });
}
function reload(remoteProp) {
  console.log(`Reload remote prop ${remoteProp}`);
  delete browserState[remoteProp];
  addRemoteProps(browserState).then(props => {
    browserState = props;
    // Log our new browserState
    console.log(browserState);
    // Render our components using our remote data
    ReactDOM.render(/*#__PURE__*/React.createElement(Child, browserState), document.getElementById("root"));
  }, res => {
    ReactDOM.render(/*#__PURE__*/React.createElement(ErrorPage, {
      message: "Something happened",
      code: res.http_code
    }), document.getElementById("root"));
  });
}
window.addEventListener("popstate", () => {
  onPathChange();
});
onPathChange();

/***/ })

};
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Y0FBYyxDQUFDZSxZQUFZLENBQUMsQ0FBQzlCLElBQUksQ0FDOUI1RixLQUFLLElBQUs7SUFDVDBILFlBQVksR0FBRzFILEtBQUs7SUFDcEI7SUFDQVYsT0FBTyxDQUFDQyxHQUFHLENBQUNtSSxZQUFZLENBQUM7SUFDekI7SUFDQXZLLFFBQVEsQ0FBQzZELE1BQU0sY0FDYjVELEtBQUEsQ0FBQStELGFBQUEsQ0FBQ0wsS0FBSyxFQUFLNEcsWUFBZSxDQUFDLEVBQzNCTSxRQUFRLENBQUNJLGNBQWMsQ0FBQyxNQUFNLENBQ2hDLENBQUM7RUFDSCxDQUFDLEVBQ0ExRixHQUFHLElBQUs7SUFDUHZGLFFBQVEsQ0FBQzZELE1BQU0sY0FDYjVELEtBQUEsQ0FBQStELGFBQUEsQ0FBQ3NGLFNBQVM7TUFBQ3BDLE9BQU8sRUFBRSxvQkFBcUI7TUFBQzhELElBQUksRUFBRXpGLEdBQUcsQ0FBQzdEO0lBQVUsQ0FBRSxDQUFDLEVBQ2pFbUosUUFBUSxDQUFDSSxjQUFjLENBQUMsTUFBTSxDQUNoQyxDQUFDO0VBQ0gsQ0FDRixDQUFDO0FBQ0g7QUFFQUUsTUFBTSxDQUFDQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsTUFBTTtFQUN4QzFJLFlBQVksQ0FBQyxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUNGQSxZQUFZLENBQUMsQ0FBQyxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViLy4vY29tcG9uZW50cy9hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcIiEhZmlsZS1sb2FkZXI/bmFtZT1bbmFtZV0uW2V4dF0hLi9pbmRleC5odG1sXCIpO1xuLyogcmVxdWlyZWQgbGlicmFyeSBmb3Igb3VyIFJlYWN0IGFwcCAqL1xudmFyIFJlYWN0RE9NID0gcmVxdWlyZShcInJlYWN0LWRvbVwiKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBjcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZShcImNyZWF0ZS1yZWFjdC1jbGFzc1wiKTtcblxuLyogcmVxdWlyZWQgY3NzIGZvciBvdXIgYXBwbGljYXRpb24gKi9cbnJlcXVpcmUoXCIuLi93ZWJmbG93L3N0eWxlcy5jc3NcIik7XG5yZXF1aXJlKFwiLi4vd2ViZmxvdy9tb2RhbC1sb2FkaW5nLmNzc1wiKTtcblxudmFyIFFzID0gcmVxdWlyZShcInFzXCIpO1xudmFyIENvb2tpZSA9IHJlcXVpcmUoXCJjb29raWVcIik7XG5cbnZhciBYTUxIdHRwUmVxdWVzdCA9IHJlcXVpcmUoXCJ4aHIyXCIpO1xudmFyIEhUVFAgPSBuZXcgKGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5nZXQgPSAodXJsKSA9PiB0aGlzLnJlcShcIkdFVFwiLCB1cmwpO1xuICB0aGlzLmRlbGV0ZSA9ICh1cmwpID0+IHRoaXMucmVxKFwiREVMRVRFXCIsIHVybCk7XG4gIHRoaXMucG9zdCA9ICh1cmwsIGRhdGEpID0+IHRoaXMucmVxKFwiUE9TVFwiLCB1cmwsIGRhdGEpO1xuICB0aGlzLnB1dCA9ICh1cmwsIGRhdGEpID0+IHRoaXMucmVxKFwiUFVUXCIsIHVybCwgZGF0YSk7XG5cbiAgdGhpcy5yZXEgPSAobWV0aG9kLCB1cmwsIGRhdGEpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgcmVxLm9wZW4obWV0aG9kLCB1cmwpO1xuICAgICAgcmVxLnJlc3BvbnNlVHlwZSA9IFwidGV4dFwiO1xuICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJhY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uLCovKjswLjhcIik7XG4gICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcImNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICByZXEub25sb2FkID0gKCkgPT4ge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSAyMDAgJiYgcmVxLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgIHJlc29sdmUocmVxLnJlc3BvbnNlVGV4dCAmJiBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoeyBodHRwX2NvZGU6IHJlcS5zdGF0dXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXEub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KHsgaHR0cF9jb2RlOiByZXEuc3RhdHVzIH0pO1xuICAgICAgfTtcbiAgICAgIHJlcS5zZW5kKGRhdGEgJiYgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH0pO1xufSkoKTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNoYW5nZSBwYWdlXG52YXIgR29UbyA9IChyb3V0ZSwgcGFyYW1zLCBxdWVyeSkgPT4ge1xuICBjb25zb2xlLmxvZyhcIkdvVG9cIik7XG4gIHZhciBxcyA9IFFzLnN0cmluZ2lmeShxdWVyeSk7XG4gIHZhciB1cmwgPSByb3V0ZXNbcm91dGVdLnBhdGgocGFyYW1zKSArIChxcyA9PSBcIlwiID8gXCJcIiA6IFwiP1wiICsgcXMpO1xuICBjb25zb2xlLmxvZyhcIkNoYW5naW5nIFVSTCB0b1wiLCB1cmwpO1xuICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJcIiwgdXJsKTtcbiAgb25QYXRoQ2hhbmdlKCk7XG59O1xuXG4vKipcbiAqIGByZW1vdGVQcm9wc2AgYXJlIGxpc3Qgb2YgZnVuY3Rpb25zIHRoYXQgbWFwIHRoZSBwcm9wcyBmcm9tIGBCcm93c2VyU3RhdGUuaGFuZGxlclBhdGhgIGluZGljYXRlZCBbaGVyZV0oaHR0cHM6Ly9naXRodWIuY29tL3Z1dGhhbmh0dW5nMjQxMi9mb3JtYXRpb24ta2Jydy9ibG9iLzgwOWFjZDc1ZTBjMWIzYTJlMGIxYzY2YTlkNzg5MWNlOWEzNmZlNzIvcmVhbGlzYXRpb24vcmVzdC93ZWIvYXBwLmpzI0wyMDgtTDIxMSlcbiAqIHRvIGB7dXJsIDogc3RyaW5nLCBwcm9wOiBzdHJpbmd9YCB3aGljaCBjYW4gYmUgdXNlZCB0byBmZXRjaCBkYXRhXG4gKiB3aXRoIFtgSFRUUGBdKGh0dHBzOi8vZ2l0aHViLmNvbS92dXRoYW5odHVuZzI0MTIvZm9ybWF0aW9uLWticncvYmxvYi9tYWluL3JlYWxpc2F0aW9uL3Jlc3Qvd2ViL2FwcC5qcyNMMTgtTDE4KVxuICovXG52YXIgcmVtb3RlUHJvcHMgPSB7XG4gIC8vIEV4YW1wbGUgb2YgaG93IHRvIGltcGxlbWVudCBhdXRoIG1lY2hhbmlzbVxuICAvLyB1c2VyOiAocHJvcHMpPT57XG4gIC8vICAgcmV0dXJuIHtcbiAgLy8gICAgIHVybDogXCIvYXBpL21lXCIsXG4gIC8vICAgICBwcm9wOiBcInVzZXJcIlxuICAvLyAgIH1cbiAgLy8gfSxcblxuICAvLyBwcm9wcyA9IHtxczogUXVlcnlTdHJpbmcsIC4uLnBhdGhQYXJhbXM6IFJlY29yZDxzdHJpbmcsc3RyaW5nPn1cbiAgb3JkZXJzOiAocHJvcHMpID0+IHtcbiAgICAvLyBFeGFtcGxlIG9mIGhvdyB0byBpbXBsZW1lbnQgYXV0aCBtZWNoYW5pc21cbiAgICAvLyBpZighcHJvcHMudXNlcilcbiAgICAvLyAgIHJldHVyblxuXG4gICAgLy8gcXMgc3RhbmRzIGZvciBxdWVyeSBzdHJpbmdcbiAgICB2YXIgcXMgPSB7XG4gICAgICAuLi5wcm9wcy5xcyxcbiAgICAgIC8vIHVzZXJfaWQ6IHByb3BzLnVzZXIudmFsdWUuaWRcbiAgICB9O1xuXG4gICAgLy8gTWFrZSBzdXJlIHNlYXJjaCBxdWVyeSBpcyBpbmNsdWRlZFxuICAgIGlmIChwcm9wcy5xcy5xKSB7XG4gICAgICBxcy5xID0gcHJvcHMucXMucTtcbiAgICB9XG5cbiAgICB2YXIgcXVlcnkgPSBRcy5zdHJpbmdpZnkocXMpO1xuICAgIHJldHVybiB7XG4gICAgICB1cmw6IFwiL2FwaS9vcmRlcnNcIiArIChxdWVyeSA9PSBcIlwiID8gXCJcIiA6IFwiP1wiICsgcXVlcnkpLFxuICAgICAgcHJvcDogXCJvcmRlcnNcIixcbiAgICB9O1xuICB9LFxuICBvcmRlcjogKHByb3BzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVybDogXCIvYXBpL29yZGVyL1wiICsgcHJvcHMub3JkZXJfaWQsXG4gICAgICBwcm9wOiBcIm9yZGVyXCIsXG4gICAgfTtcbiAgfSxcbn07XG5cbnZhciByb3V0ZXMgPSB7XG4gIG9yZGVyczoge1xuICAgIHBhdGg6IChwYXJhbXMpID0+IHtcbiAgICAgIHJldHVybiBcIi9cIjtcbiAgICB9LFxuICAgIG1hdGNoOiAocGF0aCwgcXMpID0+IHtcbiAgICAgIHJldHVybiBwYXRoID09IFwiL1wiICYmIHsgaGFuZGxlclBhdGg6IFtMYXlvdXQsIEhlYWRlciwgT3JkZXJzXSB9OyAvLyBOb3RlIHRoYXQgd2UgdXNlIHRoZSBcIiYmXCIgZXhwcmVzc2lvbiB0byBzaW11bGF0ZSBhIElGIHN0YXRlbWVudFxuICAgIH0sXG4gIH0sXG4gIG9yZGVyOiB7XG4gICAgcGF0aDogKHBhcmFtcykgPT4ge1xuICAgICAgcmV0dXJuIFwiL29yZGVyL1wiICsgcGFyYW1zO1xuICAgIH0sXG4gICAgbWF0Y2g6IChwYXRoLCBxcykgPT4ge1xuICAgICAgdmFyIHIgPSBuZXcgUmVnRXhwKFwiL29yZGVyLyhbXi9dKikkXCIpLmV4ZWMocGF0aCk7XG4gICAgICByZXR1cm4gciAmJiB7IGhhbmRsZXJQYXRoOiBbTGF5b3V0LCBIZWFkZXIsIE9yZGVyXSwgb3JkZXJfaWQ6IHJbMV0gfTsgLy8gTm90ZSB0aGF0IHdlIHVzZSB0aGUgXCImJlwiIGV4cHJlc3Npb24gdG8gc2ltdWxhdGUgYSBJRiBzdGF0ZW1lbnRcbiAgICB9LFxuICB9LFxufTtcblxudmFyIENoaWxkID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHJlbmRlcigpIHtcbiAgICB2YXIgW0NoaWxkSGFuZGxlciwgLi4ucmVzdF0gPSB0aGlzLnByb3BzLmhhbmRsZXJQYXRoO1xuICAgIHJldHVybiA8Q2hpbGRIYW5kbGVyIHsuLi50aGlzLnByb3BzfSBoYW5kbGVyUGF0aD17cmVzdH0gLz47XG4gIH0sXG59KTtcblxudmFyIGNuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICBjbGFzc2VzID0ge307XG4gIGZvciAodmFyIGkgaW4gYXJncykge1xuICAgIHZhciBhcmcgPSBhcmdzW2ldO1xuICAgIGlmICghYXJnKSBjb250aW51ZTtcbiAgICBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGFyZyB8fCBcIm51bWJlclwiID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICBhcmdcbiAgICAgICAgLnNwbGl0KFwiIFwiKVxuICAgICAgICAuZmlsdGVyKChjKSA9PiBjICE9IFwiXCIpXG4gICAgICAgIC5tYXAoKGMpID0+IHtcbiAgICAgICAgICBjbGFzc2VzW2NdID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChcIm9iamVjdFwiID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXJnKSBjbGFzc2VzW2tleV0gPSBhcmdba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5rZXlzKGNsYXNzZXMpXG4gICAgLm1hcCgoaykgPT4gKGNsYXNzZXNba10gJiYgaykgfHwgXCJcIilcbiAgICAuam9pbihcIiBcIik7XG59O1xuXG52YXIgTGF5b3V0ID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RhbDogbnVsbCxcbiAgICAgIGxvYWRlcjogbnVsbCxcbiAgICB9O1xuICB9LFxuICBtb2RhbChzcGVjKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RhbDoge1xuICAgICAgICAuLi5zcGVjLFxuICAgICAgICBjYWxsYmFjazogKHJlcykgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb2RhbDogbnVsbCB9LCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3BlYy5jYWxsYmFjaykgc3BlYy5jYWxsYmFjayhyZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgbG9hZGVyKCkge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRlcjogbnVsbCB9KTtcbiAgICB9O1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9hZGVyOiB7XG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gY2FsbGJhY2s7XG4gIH0sXG4gIHJlbmRlcigpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJlbmRlcmluZyBMYXlvdXRcIik7XG4gICAgdmFyIG1vZGFsX2NvbXBvbmVudCA9IHtcbiAgICAgIGRlbGV0ZTogKHByb3BzKSA9PiA8RGVsZXRlTW9kYWwgey4uLnByb3BzfSAvPixcbiAgICB9W3RoaXMuc3RhdGUubW9kYWwgJiYgdGhpcy5zdGF0ZS5tb2RhbC50eXBlXTtcbiAgICBtb2RhbF9jb21wb25lbnQgPSBtb2RhbF9jb21wb25lbnQgJiYgbW9kYWxfY29tcG9uZW50KHRoaXMuc3RhdGUubW9kYWwpO1xuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIC4uLnRoaXMucHJvcHMsXG4gICAgICBtb2RhbDogdGhpcy5tb2RhbCxcbiAgICAgIGxvYWRlcjogdGhpcy5sb2FkZXIsXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgPEpTWFogaW49XCJvcmRlcnNcIiBzZWw9XCIucm9vdFwiPlxuICAgICAgICA8WiBzZWw9XCIubGF5b3V0LWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxDaGlsZCB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgey8qIDx0aGlzLnByb3BzLkNoaWxkIHsuLi50aGlzLnByb3BzfSAvPiAqL31cbiAgICAgICAgICA8SlNYWlxuICAgICAgICAgICAgaW49XCJtb2RhbFwiXG4gICAgICAgICAgICBzZWw9XCIubW9kYWwtd3JhcHBlclwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NuKGNsYXNzTmFtZVosIHsgaGlkZGVuOiAhbW9kYWxfY29tcG9uZW50IH0pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHttb2RhbF9jb21wb25lbnR9XG4gICAgICAgICAgPC9KU1haPlxuICAgICAgICAgIDxKU1haXG4gICAgICAgICAgICBpbj1cImxvYWRlclwiXG4gICAgICAgICAgICBzZWw9XCIubG9hZGVyLWNvbnRhaW5lclwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NuKGNsYXNzTmFtZVosIHsgaGlkZGVuOiAhdGhpcy5zdGF0ZS5sb2FkZXIgfSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGgxPkxPQURJTkcuLi48L2gxPlxuICAgICAgICAgIDwvSlNYWj5cbiAgICAgICAgPC9aPlxuICAgICAgPC9KU1haPlxuICAgICk7XG4gIH0sXG59KTtcblxudmFyIEhlYWRlciA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlYXJjaFF1ZXJ5OiB0aGlzLnByb3BzLnFzLnEgfHwgXCJcIixcbiAgICB9O1xuICB9LFxuICBoYW5kbGVTZWFyY2hTdWJtaXQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShlLnRhcmdldCk7XG4gICAgY29uc3Qgc2VhcmNoUXVlcnkgPSBmb3JtRGF0YS5nZXQoXCJzZWFyY2hcIikgfHwgXCIqOipcIjtcblxuICAgIEdvVG8oXCJvcmRlcnNcIiwgXCJcIiwge1xuICAgICAgLi4udGhpcy5wcm9wcy5xcyxcbiAgICAgIHE6IHNlYXJjaFF1ZXJ5LFxuICAgICAgcGFnZTogMCwgLy8gUmVzZXQgdG8gZmlyc3QgcGFnZSB3aGVuIHNlYXJjaGluZ1xuICAgIH0pO1xuICB9LFxuICByZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2coXCJTdGFydCBoZWFkZXJcIik7XG4gICAgcmV0dXJuIChcbiAgICAgIDxKU1haIGluPVwib3JkZXJzXCIgc2VsPVwiLmhlYWRlci1jb250YWluZXJcIj5cbiAgICAgICAgPFogc2VsPVwiLmhlYWRpbmctZGl2LXdpdGgtc2VhcmNoXCI+XG4gICAgICAgICAgPENoaWxkcmVuWiAvPlxuICAgICAgICAgIDxKU1haIGluPVwib3JkZXJzXCIgc2VsPVwiLnNlYXJjaC1kaXZcIj5cbiAgICAgICAgICAgIDxaIHNlbD1cIi5zZWFyY2hcIiBvblN1Ym1pdD17KGUpID0+IHRoaXMuaGFuZGxlU2VhcmNoU3VibWl0KGUpfT48L1o+XG4gICAgICAgICAgPC9KU1haPlxuICAgICAgICA8L1o+XG4gICAgICAgIDxaIHNlbD1cIi5ib2R5LWRpdlwiPlxuICAgICAgICAgIDxDaGlsZCB7Li4udGhpcy5wcm9wc30gLz5cbiAgICAgICAgPC9aPlxuICAgICAgPC9KU1haPlxuICAgICk7XG4gIH0sXG59KTtcblxudmFyIERlbGV0ZU1vZGFsID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEpTWFogaW49XCJtb2RhbFwiIHNlbD1cIi5tb2RhbC1jb250ZW50XCI+XG4gICAgICAgIDxwPnt0aGlzLnByb3BzLnRpdGxlfTwvcD5cbiAgICAgICAgPHA+e3RoaXMucHJvcHMubWVzc2FnZX08L3A+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLmNhbGxiYWNrKHRydWUpO1xuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBDb25maXJtXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIENhbmNlbFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvSlNYWj5cbiAgICApO1xuICB9LFxufSk7XG5cbnZhciBPcmRlcnMgPSBjcmVhdGVSZWFjdENsYXNzKHtcbiAgLy8gYHN0YXRpY3NgYCBsZXRzIHlvdSBkZWZpbmUgc3RhdGljIG1ldGhvZHMsIGZpZWxkIHRoYXQgYmVsb25nIHRvIHRoZSBjb21wb25lbnQgaXRzZWxmLCBub3QgaXRzIGluc3RhbmNlcy5cbiAgc3RhdGljczoge1xuICAgIHJlbW90ZVByb3BzOiBbcmVtb3RlUHJvcHMub3JkZXJzXSxcbiAgfSxcbiAgcmVuZGVyKCkge1xuICAgIGNvbnNvbGUubG9nKFwiU3RhcnQgb3JkZXJzXCIpO1xuICAgIGNvbnNvbGUuZGlyKHRoaXMucHJvcHMsIHsgZGVwdGg6IG51bGwgfSk7XG4gICAgY29uc29sZS5kaXIodGhpcy5wcm9wcy5vcmRlcnMudmFsdWUsIHsgZGVwdGg6IG51bGwgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxKU1haIGluPVwib3JkZXJzXCIgc2VsPVwiLmJvZHktZGl2XCI+XG4gICAgICAgIDxaIHNlbD1cIi50YWJsZVwiPlxuICAgICAgICAgIDxKU1haIGluPVwib3JkZXJzXCIgc2VsPVwiLnRhYmxlLWhlYWRlclwiPlxuICAgICAgICAgICAgPENoaWxkcmVuWiAvPlxuICAgICAgICAgIDwvSlNYWj5cbiAgICAgICAgICA8SlNYWiBpbj1cIm9yZGVyc1wiIHNlbD1cIi50YWJsZS1ib2R5XCI+XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5vcmRlcnMudmFsdWUub3JkZXJzLnZhbHVlLm1hcCgob3JkZXIpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgY3VzdG9tID0gb3JkZXIuY3VzdG9tO1xuICAgICAgICAgICAgICBjb25zdCBiaWxsaW5nX2FkZHJlc3MgPSBjdXN0b20uYmlsbGluZ19hZGRyZXNzO1xuICAgICAgICAgICAgICBjb25zdCBwYXltZW50ID0gY3VzdG9tLm1hZ2VudG8ucGF5bWVudDtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8SlNYWiBpbj1cIm9yZGVyc1wiIHNlbD1cIi50YWJsZS1yb3dcIiBrZXk9e29yZGVyLmlkfT5cbiAgICAgICAgICAgICAgICAgIDxaIHNlbD1cIi5kaXYtYm9keS10YWJsZSAuaWRcIj57b3JkZXIucmVtb3RlaWR9PC9aPlxuICAgICAgICAgICAgICAgICAgPFogc2VsPVwiLmRpdi1ib2R5LXRhYmxlIC5uYW1lXCI+e2N1c3RvbS5jdXN0b21lci5mdWxsX25hbWV9PC9aPlxuICAgICAgICAgICAgICAgICAgPFogc2VsPVwiLmRpdi1ib2R5LXRhYmxlIC5hZGRyZXNzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtgJHtiaWxsaW5nX2FkZHJlc3Muc3RyZWV0WzBdfSwgXG4gICAgICAgICAgICAgICAgICAgICR7YmlsbGluZ19hZGRyZXNzLmNpdHl9LCBcbiAgICAgICAgICAgICAgICAgICAgJHtiaWxsaW5nX2FkZHJlc3MucG9zdGNvZGV9LCBcbiAgICAgICAgICAgICAgICAgICAgJHtiaWxsaW5nX2FkZHJlc3MuY291bnRyeV9pZH1gfVxuICAgICAgICAgICAgICAgICAgPC9aPlxuICAgICAgICAgICAgICAgICAgPFogc2VsPVwiLmRpdi1ib2R5LXRhYmxlIC5xdWFudGl0eVwiPntjdXN0b20uaXRlbXMubGVuZ3RofTwvWj5cbiAgICAgICAgICAgICAgICAgIDxaXG4gICAgICAgICAgICAgICAgICAgIGluPVwib3JkZXJzXCJcbiAgICAgICAgICAgICAgICAgICAgc2VsPVwiLmRpdi1ib2R5LXRhYmxlIC5idXR0b24tZGV0YWlsXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIEdvVG8oXCJvcmRlclwiLCBvcmRlci5pZCk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIO+BoVxuICAgICAgICAgICAgICAgICAgPC9aPlxuICAgICAgICAgICAgICAgICAgPFogaW49XCJvcmRlcnNcIiBzZWw9XCIuZGl2LWJvZHktdGFibGUgLmJ1dHRvbi1wYXlcIj48L1o+XG4gICAgICAgICAgICAgICAgICA8WiBpbj1cIm9yZGVyc1wiIHNlbD1cIi5kaXYtYmxvY2stNiAudGFnLXN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7cGF5bWVudC5hY2NvdW50X3N0YXR1cyA/IHBheW1lbnQuYWNjb3VudF9zdGF0dXMgOiBcIk51bGxcIn1cbiAgICAgICAgICAgICAgICAgIDwvWj5cbiAgICAgICAgICAgICAgICAgIDxaIGluPVwib3JkZXJzXCIgc2VsPVwiLmRpdi1ibG9jay02IC50YWctZGVsaXZlcnlcIj5cbiAgICAgICAgICAgICAgICAgICAge3BheW1lbnQuYWRkaXRpb25hbF9pbmZvcm1hdGlvblsxXX1cbiAgICAgICAgICAgICAgICAgIDwvWj5cbiAgICAgICAgICAgICAgICAgIDxaXG4gICAgICAgICAgICAgICAgICAgIGluPVwib3JkZXJzXCJcbiAgICAgICAgICAgICAgICAgICAgc2VsPVwiLmJ1dHRvbi1kZWxldGVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWxldGUgb3JkZXJcIiwgb3JkZXIuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJkZWxldGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIk9yZGVyIGRlbGV0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBvcmRlciAke29yZGVyLmlkfSA/YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIGxvYWRlciBhbmQgSFRUUCByZXF1ZXN0IGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVyX2NhbGxiYWNrID0gdGhpcy5wcm9wcy5sb2FkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBIVFRQLmRlbGV0ZShgL2FwaS9vcmRlci8ke29yZGVyLmlkfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxvYWQoXCJvcmRlcnNcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPcmRlciAke29yZGVyLmlkfSBkZWxldGVkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJEZWxldGlvbiBmYWlsc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlcl9jYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPcmRlciAke29yZGVyLmlkfSBkZWxldGlvbiBjYW5jZWxsZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZVxuICAgICAgICAgICAgICAgICAgPC9aPlxuICAgICAgICAgICAgICAgIDwvSlNYWj5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgIDwvSlNYWj5cbiAgICAgICAgPC9aPlxuICAgICAgICA8Q2hpbGRyZW5aIC8+XG4gICAgICAgIDxaXG4gICAgICAgICAgc2VsPVwiLmJhY2tcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR28gYmFjayB0byBvcmRlcnNcIik7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5xcy5wYWdlICYmIE51bWJlcih0aGlzLnByb3BzLnFzLnBhZ2UpKSB7XG4gICAgICAgICAgICAgIEdvVG8oXCJvcmRlcnNcIiwgXCJcIiwge1xuICAgICAgICAgICAgICAgIC4uLnRoaXMucHJvcHMucXMsXG4gICAgICAgICAgICAgICAgcGFnZTogTnVtYmVyKHRoaXMucHJvcHMucXMucGFnZSkgLSAxLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm8gcHJldmlvdXMgcGFnZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPENoaWxkcmVuWiAvPlxuICAgICAgICA8L1o+XG4gICAgICAgIDxaIHNlbD1cIi5jdXJyXCI+e051bWJlcih0aGlzLnByb3BzLnFzLnBhZ2UgfHwgXCIwXCIpfTwvWj5cbiAgICAgICAgPFpcbiAgICAgICAgICBzZWw9XCIuZm9yd2FyZFwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJuZXh0IHBhZ2VcIik7XG4gICAgICAgICAgICBHb1RvKFwib3JkZXJzXCIsIFwiXCIsIHtcbiAgICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5xcyxcbiAgICAgICAgICAgICAgcGFnZTogTnVtYmVyKHRoaXMucHJvcHMucXMucGFnZSB8fCBcIjBcIikgKyAxLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxDaGlsZHJlblogLz5cbiAgICAgICAgPC9aPlxuICAgICAgPC9KU1haPlxuICAgICk7XG4gIH0sXG59KTtcblxudmFyIE9yZGVyID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHN0YXRpY3M6IHtcbiAgICByZW1vdGVQcm9wczogW3JlbW90ZVByb3BzLm9yZGVyXSxcbiAgfSxcbiAgcmVuZGVyKCkge1xuICAgIGNvbnNvbGUubG9nKFwiT3JkZXIgcHJvcHNcIik7XG4gICAgY29uc3Qgb3JkZXIgPSB0aGlzLnByb3BzLm9yZGVyLnZhbHVlO1xuICAgIGNvbnNvbGUuZGlyKG9yZGVyLCB7IGRlcHRoOiBudWxsIH0pO1xuICAgIGNvbnN0IGN1c3RvbSA9IG9yZGVyLmN1c3RvbTtcbiAgICByZXR1cm4gKFxuICAgICAgPEpTWFogaW49XCJvcmRlci1kZXRhaWxcIiBzZWw9XCIuYm9keS1kaXZcIj5cbiAgICAgICAgPFogc2VsPVwiLm9yZGVyLWlkXCI+e29yZGVyLnJlbW90ZWlkfTwvWj5cbiAgICAgICAgPFogc2VsPVwiLm5hbWVcIj57b3JkZXIuY3VzdG9tLmN1c3RvbWVyLmZ1bGxfbmFtZX08L1o+XG4gICAgICAgIDxaIHNlbD1cIi5hZGRyZXNzXCI+XG4gICAgICAgICAge2Ake2N1c3RvbS5iaWxsaW5nX2FkZHJlc3Muc3RyZWV0WzBdfSwgXG4gICAgICAgICAgJHtjdXN0b20uYmlsbGluZ19hZGRyZXNzLmNpdHl9LCBcbiAgICAgICAgICAke2N1c3RvbS5iaWxsaW5nX2FkZHJlc3MucG9zdGNvZGV9LCBcbiAgICAgICAgICAke2N1c3RvbS5iaWxsaW5nX2FkZHJlc3MuY291bnRyeV9pZH1gfVxuICAgICAgICA8L1o+XG4gICAgICAgIDxaIHNlbD1cIi5udW1iZXJcIj57b3JkZXIucmVtb3RlaWR9PC9aPlxuICAgICAgICA8WiBzZWw9XCIudGFibGVcIj5cbiAgICAgICAgICA8SlNYWiBpbj1cIm9yZGVyLWRldGFpbFwiIHNlbD1cIi5vcmRlci1yb3dcIj48L0pTWFo+XG4gICAgICAgICAge2N1c3RvbS5pdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxKU1haIGluPVwib3JkZXItZGV0YWlsXCIgc2VsPVwiLm9yZGVyLXJvd1wiIGtleT17aXRlbS5pdGVtX2lkfT5cbiAgICAgICAgICAgICAgICA8WiBzZWw9XCIucHJvZHVjdC1uYW1lXCI+e2l0ZW0ucHJvZHVjdF90aXRsZX08L1o+XG4gICAgICAgICAgICAgICAgPFogc2VsPVwiLnByb2R1Y3QtcXVhbnRpdHlcIj57aXRlbS5xdWFudGl0eV90b19mZXRjaH08L1o+XG4gICAgICAgICAgICAgICAgPFogc2VsPVwiLnByb2R1Y3QtcHJpY2VcIj57aXRlbS5wcmljZX08L1o+XG4gICAgICAgICAgICAgICAgPFogc2VsPVwiLnByb2R1Y3QtdG90YWxcIj5cbiAgICAgICAgICAgICAgICAgIHtpdGVtLnByaWNlICogaXRlbS5xdWFudGl0eV90b19mZXRjaH1cbiAgICAgICAgICAgICAgICA8L1o+XG4gICAgICAgICAgICAgIDwvSlNYWj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvWj5cbiAgICAgICAgPFpcbiAgICAgICAgICBzZWw9XCIuYnV0dG9uLWJhY2tcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR28gYmFjayB0byBvcmRlcnNcIik7XG4gICAgICAgICAgICBoaXN0b3J5LmJhY2soKTtcbiAgICAgICAgICB9fVxuICAgICAgICA+PC9aPlxuICAgICAgPC9KU1haPlxuICAgICk7XG4gIH0sXG59KTtcblxudmFyIEVycm9yUGFnZSA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxoMT5cbiAgICAgICAge3RoaXMucHJvcHMubWVzc2FnZX0ge3RoaXMucHJvcHMuZXJyb3J9XG4gICAgICA8L2gxPlxuICAgICk7XG4gIH0sXG59KTtcblxuLyoqXG4gKiBgYnJvd3NlclN0YXRlYCBnb25uYSBiZSBwYXNzZWQgYXMgcGFyYW1ldGVyIGluIGBhZGRSZW1vdGVQcm9wc2BcbiAqIGBhZGRSZW1vdGVQcm9wc2AgbW9kaWZpZXMgaXQgdG8gYWRkIHRoZSBkYXRhIGZyb20gdGhlIEFQSS5cbiAqIHRoZSByZXN1bHQgb2YgdGhlIEFQSSB3aWxsIGJlIHN0b3JlZCBpbiBhIGtleSB3aXRoIHZhbHVlIG9mIGByZW1vdGVQcm9wLnByb3BgXG4gKiBbcmVmXShodHRwczovL2dpdGh1Yi5jb20vdnV0aGFuaHR1bmcyNDEyL2Zvcm1hdGlvbi1rYnJ3L2Jsb2IvODA5YWNkNzVlMGMxYjNhMmUwYjFjNjZhOWQ3ODkxY2U5YTM2ZmU3Mi9yZWFsaXNhdGlvbi9yZXN0L3dlYi9hcHAuanMjTDgwLUw4MClcbiAqL1xuZnVuY3Rpb24gYWRkUmVtb3RlUHJvcHMocHJvcHMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkFkZGluZyByZW1vdGUgcHJvcHNcIik7XG4gICAgdmFyIHJlbW90ZVByb3BzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShcbiAgICAgIFtdLFxuICAgICAgcHJvcHMuaGFuZGxlclBhdGhcbiAgICAgICAgLy8gT3JkZXJzLnJlbW90ZVByb3BzID0gcmVtb3RlUHJvcHMub3JkZXJzXG4gICAgICAgIC5tYXAoKGMpID0+IGMucmVtb3RlUHJvcHMpIC8vIC0+IFtbcmVtb3RlUHJvcHMub3JkZXJzXSwgbnVsbF1cbiAgICAgICAgLmZpbHRlcigocCkgPT4gcCkgLy8gLT4gW1tyZW1vdGVQcm9wcy5vcmRlcnNdXVxuICAgICk7XG4gICAgLy8gRXZlbnR1YWxseSwgdGhpcyBwcm9kdWNlICgoe3FzOiBRdWVyeVN0cmluZywgLi4ucGF0aFBhcmFtczogUmVjb3JkPHN0cmluZyxzdHJpbmc+fSkgPT4ge3VybDogc3RyaW5nLCBwcm9wOiBzdHJpbmd9KVtdXG5cbiAgICByZW1vdGVQcm9wcyA9IHJlbW90ZVByb3BzXG4gICAgICAubWFwKChzcGVjX2Z1bikgPT4gc3BlY19mdW4ocHJvcHMpKSAvLyBbe3VybDogJy9hcGkvb3JkZXJzJywgcHJvcDogJ29yZGVycyd9XVxuICAgICAgLmZpbHRlcigoc3BlY3MpID0+IHNwZWNzKSAvLyBnZXQgcmlkIG9mIHVuZGVmaW5lZCBmcm9tIHJlbW90ZVByb3BzIHRoYXQgZG9uJ3QgbWF0Y2ggdGhlaXIgZGVwZW5kZW5jaWVzXG4gICAgICAuZmlsdGVyKFxuICAgICAgICAoc3BlY3MpID0+ICFwcm9wc1tzcGVjcy5wcm9wXSB8fCBwcm9wc1tzcGVjcy5wcm9wXS51cmwgIT0gc3BlY3MudXJsXG4gICAgICApOyAvLyBnZXQgcmlkIG9mIHJlbW90ZVByb3BzIGFscmVhZHkgcmVzb2x2ZWQgd2l0aCB0aGUgdXJsXG5cbiAgICAvLyBJZiBub3cgbmV3IHJlbW90ZVBvcnBzIHRvIGZldGNoLCB3ZSByZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggdGhlIGN1cnJlbnQgcHJvcHNcbiAgICBpZiAocmVtb3RlUHJvcHMubGVuZ3RoID09IDApIHJldHVybiByZXNvbHZlKHByb3BzKTtcblxuICAgIGNvbnN0IHByb21pc2VfbWFwcGVyID0gKHNwZWMpID0+IHtcbiAgICAgIC8vIHdlIHdhbnQgdG8ga2VlcCB0aGUgdXJsIGluIHRoZSB2YWx1ZSByZXNvbHZlZCBieSB0aGUgcHJvbWlzZSBoZXJlIDogc3BlYyA9IHt1cmw6ICcvYXBpL29yZGVycycsIHZhbHVlOiBPUkRFUlMsIHByb3A6ICdvcmRlcnMnfVxuICAgICAgcmV0dXJuIEhUVFAuZ2V0KHNwZWMudXJsKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgc3BlYy52YWx1ZSA9IHJlcztcbiAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgcmVkdWNlciA9IChhY2MsIHNwZWMpID0+IHtcbiAgICAgIC8vIHNwZWMgPSB7dXJsOiAnL2FwaS9vcmRlcnMnLCB2YWx1ZTogT1JERVJTLCBwcm9wOiAndXNlcid9XG4gICAgICBhY2Nbc3BlYy5wcm9wXSA9IHsgdXJsOiBzcGVjLnVybCwgdmFsdWU6IHNwZWMudmFsdWUgfTtcbiAgICAgIHJldHVybiBhY2M7XG4gICAgfTtcblxuICAgIGNvbnN0IHByb21pc2VfYXJyYXkgPSByZW1vdGVQcm9wcy5tYXAocHJvbWlzZV9tYXBwZXIpO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlX2FycmF5KVxuICAgICAgLnRoZW4oKHhzKSA9PiB4cy5yZWR1Y2UocmVkdWNlciwgcHJvcHMpLCByZWplY3QpXG4gICAgICAudGhlbigocCkgPT4ge1xuICAgICAgICAvLyByZWN1cnNpdmVseSBjYWxsIHJlbW90ZSBwcm9wcywgYmVjYXVzZSBwcm9wcyBjb21wdXRlZCBmcm9tXG4gICAgICAgIC8vIHByZXZpb3VzIHF1ZXJpZXMgY2FuIGdpdmUgdGhlIG1pc3NpbmcgZGF0YS9wcm9wcyBuZWNlc3NhcnlcbiAgICAgICAgLy8gdG8gZGVmaW5lIGFub3RoZXIgcXVlcnlcbiAgICAgICAgcmV0dXJuIGFkZFJlbW90ZVByb3BzKHApLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gIH0pO1xufVxuXG52YXIgYnJvd3NlclN0YXRlID0ge307XG5mdW5jdGlvbiBvblBhdGhDaGFuZ2UoKSB7XG4gIHZhciBwYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XG4gIHZhciBxcyA9IFFzLnBhcnNlKGxvY2F0aW9uLnNlYXJjaC5zbGljZSgxKSk7XG4gIGNvbnNvbGUubG9nKFwicXVlcnkgc3RyaW5nXCIpO1xuICBjb25zb2xlLmRpcihxcywgeyBkZXB0aDogbnVsbCB9KTtcbiAgdmFyIGNvb2tpZXMgPSBDb29raWUucGFyc2UoZG9jdW1lbnQuY29va2llKTtcblxuICBicm93c2VyU3RhdGUgPSB7XG4gICAgLi4uYnJvd3NlclN0YXRlLFxuICAgIHBhdGg6IHBhdGgsXG4gICAgcXM6IHFzLFxuICAgIGNvb2tpZTogY29va2llcyxcbiAgfTtcblxuICB2YXIgcm91dGU7XG5cbiAgLy8gV2UgdHJ5IHRvIG1hdGNoIHRoZSByZXF1ZXN0ZWQgcGF0aCB0byBvbmUgb3VyIG91ciByb3V0ZXNcbiAgZm9yICh2YXIga2V5IGluIHJvdXRlcykge1xuICAgIHJvdXRlUHJvcHMgPSByb3V0ZXNba2V5XS5tYXRjaChwYXRoLCBxcyk7XG4gICAgaWYgKHJvdXRlUHJvcHMpIHtcbiAgICAgIHJvdXRlID0ga2V5O1xuICAgICAgY29uc29sZS5sb2coXCJyb3V0ZVByb3BzXCIpO1xuICAgICAgY29uc29sZS5kaXIocm91dGVQcm9wcywgeyBkZXB0aDogbnVsbCB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGFkZCB0aGUgcm91dGUgbmFtZSBhbmQgdGhlIHJvdXRlIFByb3BzIHRvIHRoZSBnbG9iYWwgYnJvd3NlclN0YXRlXG4gIGJyb3dzZXJTdGF0ZSA9IHtcbiAgICAuLi5icm93c2VyU3RhdGUsXG4gICAgLi4ucm91dGVQcm9wcyxcbiAgICByb3V0ZTogcm91dGUsXG4gIH07XG4gIGNvbnNvbGUubG9nKFwiYnJvd3NlclN0YXRlOlwiKTtcbiAgY29uc29sZS5kaXIoYnJvd3NlclN0YXRlLCB7IGRlcHRoOiBudWxsIH0pO1xuXG4gIC8vIElmIHRoZSBwYXRoIGluIHRoZSBVUkwgZG9lc24ndCBtYXRjaCB3aXRoIGFueSBvZiBvdXIgcm91dGVzLCB3ZSByZW5kZXIgYW4gRXJyb3IgY29tcG9uZW50ICh3ZSB3aWxsIGhhdmUgdG8gY3JlYXRlIGl0IGxhdGVyKVxuICBpZiAoIXJvdXRlKVxuICAgIHJldHVybiBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RXJyb3JQYWdlIG1lc3NhZ2U9e1wiTm90IEZvdW5kXCJ9IGNvZGU9ezQwNH0gLz4sXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIilcbiAgICApO1xuXG4gIGFkZFJlbW90ZVByb3BzKGJyb3dzZXJTdGF0ZSkudGhlbihcbiAgICAocHJvcHMpID0+IHtcbiAgICAgIGJyb3dzZXJTdGF0ZSA9IHByb3BzO1xuICAgICAgLy8gTG9nIG91ciBuZXcgYnJvd3NlclN0YXRlXG4gICAgICBjb25zb2xlLmxvZyhicm93c2VyU3RhdGUpO1xuICAgICAgLy8gUmVuZGVyIG91ciBjb21wb25lbnRzIHVzaW5nIG91ciByZW1vdGUgZGF0YVxuICAgICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8Q2hpbGQgey4uLmJyb3dzZXJTdGF0ZX0gLz4sXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKVxuICAgICAgKTtcbiAgICB9LFxuICAgIChyZXMpID0+IHtcbiAgICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPEVycm9yUGFnZSBtZXNzYWdlPXtcIlNoaXQgaGFwcGVuZWRcIn0gY29kZT17cmVzLmh0dHBfY29kZX0gLz4sXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKVxuICAgICAgKTtcbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlbG9hZChyZW1vdGVQcm9wKSB7XG4gIGNvbnNvbGUubG9nKGBSZWxvYWQgcmVtb3RlIHByb3AgJHtyZW1vdGVQcm9wfWApO1xuICBkZWxldGUgYnJvd3NlclN0YXRlW3JlbW90ZVByb3BdO1xuICBhZGRSZW1vdGVQcm9wcyhicm93c2VyU3RhdGUpLnRoZW4oXG4gICAgKHByb3BzKSA9PiB7XG4gICAgICBicm93c2VyU3RhdGUgPSBwcm9wcztcbiAgICAgIC8vIExvZyBvdXIgbmV3IGJyb3dzZXJTdGF0ZVxuICAgICAgY29uc29sZS5sb2coYnJvd3NlclN0YXRlKTtcbiAgICAgIC8vIFJlbmRlciBvdXIgY29tcG9uZW50cyB1c2luZyBvdXIgcmVtb3RlIGRhdGFcbiAgICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPENoaWxkIHsuLi5icm93c2VyU3RhdGV9IC8+LFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIilcbiAgICAgICk7XG4gICAgfSxcbiAgICAocmVzKSA9PiB7XG4gICAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxFcnJvclBhZ2UgbWVzc2FnZT17XCJTb21ldGhpbmcgaGFwcGVuZWRcIn0gY29kZT17cmVzLmh0dHBfY29kZX0gLz4sXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKVxuICAgICAgKTtcbiAgICB9XG4gICk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgKCkgPT4ge1xuICBvblBhdGhDaGFuZ2UoKTtcbn0pO1xub25QYXRoQ2hhbmdlKCk7XG4iXSwibmFtZXMiOlsicmVxdWlyZSIsIlJlYWN0RE9NIiwiUmVhY3QiLCJjcmVhdGVSZWFjdENsYXNzIiwiUXMiLCJDb29raWUiLCJYTUxIdHRwUmVxdWVzdCIsIkhUVFAiLCJnZXQiLCJ1cmwiLCJyZXEiLCJkZWxldGUiLCJwb3N0IiwiZGF0YSIsInB1dCIsIm1ldGhvZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJvbmxvYWQiLCJzdGF0dXMiLCJyZXNwb25zZVRleHQiLCJKU09OIiwicGFyc2UiLCJodHRwX2NvZGUiLCJvbmVycm9yIiwiZXJyIiwic2VuZCIsInN0cmluZ2lmeSIsIkdvVG8iLCJyb3V0ZSIsInBhcmFtcyIsInF1ZXJ5IiwiY29uc29sZSIsImxvZyIsInFzIiwicm91dGVzIiwicGF0aCIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJvblBhdGhDaGFuZ2UiLCJyZW1vdGVQcm9wcyIsIm9yZGVycyIsInByb3BzIiwicSIsInByb3AiLCJvcmRlciIsIm9yZGVyX2lkIiwibWF0Y2giLCJoYW5kbGVyUGF0aCIsIkxheW91dCIsIkhlYWRlciIsIk9yZGVycyIsInIiLCJSZWdFeHAiLCJleGVjIiwiT3JkZXIiLCJDaGlsZCIsImRpc3BsYXlOYW1lIiwicmVuZGVyIiwiQ2hpbGRIYW5kbGVyIiwicmVzdCIsImNyZWF0ZUVsZW1lbnQiLCJfZXh0ZW5kcyIsImNuIiwiYXJncyIsImFyZ3VtZW50cyIsImNsYXNzZXMiLCJpIiwiYXJnIiwic3BsaXQiLCJmaWx0ZXIiLCJjIiwibWFwIiwia2V5IiwiT2JqZWN0Iiwia2V5cyIsImsiLCJqb2luIiwiZ2V0SW5pdGlhbFN0YXRlIiwibW9kYWwiLCJsb2FkZXIiLCJzcGVjIiwic2V0U3RhdGUiLCJjYWxsYmFjayIsInJlcyIsIm1vZGFsX2NvbXBvbmVudCIsIkRlbGV0ZU1vZGFsIiwic3RhdGUiLCJ0eXBlIiwiY2xhc3NOYW1lIiwiaGlkZGVuIiwic2VhcmNoUXVlcnkiLCJoYW5kbGVTZWFyY2hTdWJtaXQiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwidGFyZ2V0IiwicGFnZSIsImhyZWYiLCJzdHlsZSIsInRleHREZWNvcmF0aW9uIiwiYWN0aW9uIiwibWF4TGVuZ3RoIiwibmFtZSIsInBsYWNlaG9sZGVyIiwiaWQiLCJyZXF1aXJlZCIsImRlZmF1bHRWYWx1ZSIsIm9uU3VibWl0IiwidGl0bGUiLCJtZXNzYWdlIiwib25DbGljayIsInN0YXRpY3MiLCJkaXIiLCJkZXB0aCIsInZhbHVlIiwiY3VzdG9tIiwiYmlsbGluZ19hZGRyZXNzIiwicGF5bWVudCIsIm1hZ2VudG8iLCJyZW1vdGVpZCIsImN1c3RvbWVyIiwiZnVsbF9uYW1lIiwic3RyZWV0IiwiY2l0eSIsInBvc3Rjb2RlIiwiY291bnRyeV9pZCIsIml0ZW1zIiwibGVuZ3RoIiwiaW4iLCJhY2NvdW50X3N0YXR1cyIsImFkZGl0aW9uYWxfaW5mb3JtYXRpb24iLCJsb2FkZXJfY2FsbGJhY2siLCJ0aGVuIiwiXyIsInJlbG9hZCIsImNhdGNoIiwiYWxlcnQiLCJmaW5hbGx5IiwiTnVtYmVyIiwiaXRlbSIsIml0ZW1faWQiLCJwcm9kdWN0X3RpdGxlIiwicXVhbnRpdHlfdG9fZmV0Y2giLCJwcmljZSIsImJhY2siLCJFcnJvclBhZ2UiLCJlcnJvciIsImFkZFJlbW90ZVByb3BzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjb25jYXQiLCJhcHBseSIsInAiLCJzcGVjX2Z1biIsInNwZWNzIiwicHJvbWlzZV9tYXBwZXIiLCJyZWR1Y2VyIiwiYWNjIiwicHJvbWlzZV9hcnJheSIsImFsbCIsInhzIiwicmVkdWNlIiwiYnJvd3NlclN0YXRlIiwibG9jYXRpb24iLCJwYXRobmFtZSIsInNlYXJjaCIsInNsaWNlIiwiY29va2llcyIsImRvY3VtZW50IiwiY29va2llIiwicm91dGVQcm9wcyIsImNvZGUiLCJnZXRFbGVtZW50QnlJZCIsInJlbW90ZVByb3AiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIl0sInNvdXJjZVJvb3QiOiIifQ==