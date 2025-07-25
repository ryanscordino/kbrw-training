require("!!file-loader?name=[name].[ext]!./index.html");
/* required library for our React app */
var ReactDOM = require("react-dom");
var React = require("react");
var createReactClass = require("create-react-class");

/* required css for our application */
require("./webflow/style.css");

var orders = [
  {
    remoteid: "000000189",
    custom: {
      customer: { full_name: "TOTO & CIE" },
      billing_address: "Some where in the world",
    },
    items: 2,
  },
  {
    remoteid: "000000190",
    custom: {
      customer: { full_name: "Looney Toons" },
      billing_address: "The Warner Bros Company",
    },
    items: 3,
  },
  {
    remoteid: "000000191",
    custom: {
      customer: { full_name: "Asterix & Obelix" },
      billing_address: "Armorique",
    },
    items: 29,
  },
  {
    remoteid: "000000192",
    custom: {
      customer: { full_name: "Lucky Luke" },
      billing_address: "A Cowboy doesn't have an address. Sorry",
    },
    items: 0,
  },
];

var Orders = createReactClass({
  statics: {
    remoteProps: [remoteProps.orders]
  },
  render() {
    return (
      <JSXZ in="order" sel=".root">
        <Z sel=".table-body">
          {orders.map((order) => (
            <JSXZ in="order" sel=".table-row">
              <Z sel=".id">{order.remoteid}</Z>
              <Z sel=".name">{order.custom.customer.full_name}</Z>
              <Z sel=".address">{order.custom.billing_address}</Z>
              <Z sel=".quantity">{order.items}</Z>
            </JSXZ>
          ))}
        </Z>
      </JSXZ>
    );
  },
});

var Order = createReactClass({
  render() {
    <JSXZ in="order" sel=".root">
      <p>empty order</p>
    </JSXZ>
  }
})

var ErrorPage = createReactClass({
  render() {
    return (
      <JSXZ in="header" sel=".header">
        <Z sel=".header-container">
          {props.message}
        </Z>
      </JSXZ>
    )
  }
})

var Header = createReactClass({
  render() {
    return (
      <JSXZ in="header" sel=".header">
        <Z sel=".header-container">
          <p>empty header</p>
        </Z>
      </JSXZ>
    )
  }
})

var Layout = createReactClass({
  render() {
    return <JSXZ in="orders" sel=".layout">
      <Z sel=".layout-container">
        <this.props.Child {...this.props} />
      </Z>
    </JSXZ>
  }
})

var Qs = require('qs')
var Cookie = require('cookie')
var browserState = { Child: Child }

function onPathChange() {
  var path = location.pathname
  var qs = Qs.parse(location.search.slice(1))
  var cookies = Cookie.parse(document.cookie)

  browserState = {
    ...browserState,
    path: path,
    qs: qs,
    cookie: cookies
  }
  var route

  for (var key in routes) {
    var routeProps = routes[key].match(path, qs)
    if (routeProps) {
      route = key
      break;
    }
  }

  browserState = {
    ...browserState,
    ...routeProps,
    route: route
  }

  addRemoteProps(browserState).then(
    (props) => {
      browserState = props
      // Log our new browserState
      console.log(browserState)
      // Render our components using our remote data
      ReactDOM.render(<Child {...browserState} />, document.getElementById('root'))
    }, (res) => {
      ReactDOM.render(<ErrorPage message={"Shit happened"} code={res.http_code} />, document.getElementById('root'))
    })
}

var GoTo = (route, params, query) => {
  var qs = Qs.stringify(query)
  var url = routes[route].path(params) + ((qs == '') ? '' : ('?' + qs))
  history.pushState({}, "", url)
  onPathChange()
}

var routes = {
  "orders": {
    path: (params) => { return "/" },
    match: (path, qs) => {
      return (path == "/") && { handlerPath: [Layout, Header, Orders] }
    },
    "order": {
      path: (params) => {
        return "/order/" + params
      },
      match: (path, qs) => {
        var r = new RegExp("/order/([^/]*)$").exec(path)
        return r && { handlerPath: [Layout, Header, Order], order_id: r[1] }
      }
    }
  }
}

var Child = createReactClass({
  render() {
    var [ChildHandler, ...rest] = this.props.handlerPath
    return <ChildHandler {...this.props} handlerPath={rest} />
  }
})

var XMLHttpRequest = require("xhr2")
var HTTP = new (function() {
  this.get = (url) => this.req('GET', url)
  this.delete = (url) => this.req('DELETE', url)
  this.post = (url, data) => this.req('POST', url, data)
  this.put = (url, data) => this.req('PUT', url, data)

  this.req = (method, url, data) => new Promise((resolve, reject) => {
    var req = new XMLHttpRequest()
    req.open(method, url)
    req.responseType = "text"
    req.setRequestHeader("accept", "application/json,*/*;0.8")
    req.setRequestHeader("content-type", "application/json")
    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        resolve(req.responseText && JSON.parse(req.responseText))
      } else {
        reject({ http_code: req.status })
      }
    }
    req.onerror = (err) => {
      reject({ http_code: req.status })
    }
    req.send(data && JSON.stringify(data))
  })
})()

var remoteProps = {
  orders: (props) => {
    if (!props.user)
      return
    var qs = { ...props.qs, user_id: props.user.value.id }
    var query = Qs.stringify(qs)
    return {
      url: "/api/orders" + (query == '' ? '' : '?' + query),
      prop: "orders"
    }
  },
  order: (props) => {
    return {
      url: "/api/order/" + props.order_id,
      prop: "order"
    }
  }
}

function addRemoteProps(props) {
  return new Promise((resolve, reject) => {
    var remoteProps = Array.prototype.concat.apply([],
      props.handlerPath
        .map((c) => c.remoteProps) // -> [[remoteProps.orders], null]
        .filter((p) => p) // -> [[remoteProps.orders]]
    )
    remoteProps = remoteProps
      .map((spec_fun) => spec_fun(props)) // [{url: '/api/orders', prop: 'orders'}]
      .filter((specs) => specs) // get rid of undefined from remoteProps that don't match their dependencies
      .filter((specs) => !props[specs.prop] || props[specs.prop].url != specs.url) // get rid of remoteProps already resolved with the url
    if (remoteProps.length == 0)
      return resolve(props)
    // All remoteProps can be queried in parallel. This is just the function definition, see its use below.
    const promise_mapper = (spec) => {
      // we want to keep the url in the value resolved by the promise here : spec = {url: '/api/orders', value: ORDERS, prop: 'orders'}
      return HTTP.get(spec.url).then((res) => { spec.value = res; return spec })
    }

    const reducer = (acc, spec) => {
      // spec = url: '/api/orders', value: ORDERS, prop: 'user'}
      acc[spec.prop] = { url: spec.url, value: spec.value }
      return acc
    }

    const promise_array = remoteProps.map(promise_mapper)
    return Promise.all(promise_array)
      .then(xs => xs.reduce(reducer, props), reject)
      .then((p) => {
        // recursively call remote props, because props computed from
        // previous queries can give the missing data/props necessary
        // to define another query
        return addRemoteProps(p).then(resolve, reject)
      }, reject)
  })
}

// First render
// ReactDOM.render(<Page />, document.getElementById("root"));

// Event Listener
window.addEventListener("popstate", () => { onPathChange() })
onPathChange()

