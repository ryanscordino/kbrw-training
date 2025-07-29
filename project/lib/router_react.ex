defmodule RouterReact do
  @moduledoc """
  This module build a router which interacts with the `:kv_table`. Because some of the funcions here are extented by macro, we can't document them direclty. We are going to describe them directly here.

  `get(/search)`
  Search values from a list of params. Be careful! If you put a duplicate key (two times the same key), one is going to be replace by the others.
  """

  use Plug.Router

  plug(Plug.Static, from: "priv/static", at: "/static")
  plug(:match)
  plug(:dispatch)

  get("/main.js", do: send_file(conn, 200, "priv/static/main.js"))
  get("/styles.js", do: send_file(conn, 200, "priv/static/styles.js"))
  get("/styles.css", do: send_file(conn, 200, "priv/static/styles.css"))

  get("/api/orders") do
    # Get the first 10 orders from the database
    orders_data = Server.Database.get_first_n(Db, 10)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Poison.encode!(orders_data))
  end

  get("/api/order/:id") do
    order_id = conn.path_params["id"]
    IO.inspect(order_id)

    case Server.Database.get(Db, order_id) do
      [{_key, order}] ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(order))

      [] ->
        send_resp(conn, 404, "Order not found")
    end
  end

  get("/api/search") do
    with %Plug.Conn{query_params: params} <- Plug.Conn.fetch_query_params(conn),
         [{_id, response}] <- Server.Database.search(Db, params) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Poison.encode!(response))
    else
      _ -> send_resp(conn, 404, "No data found")
    end
  end

  delete("/api/order/:id") do
    order_id = conn.path_params["id"]

    case Server.Database.delete(Db, order_id) do
      :ok ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(%{message: "Order deleted successfully"}))

      _ ->
        send_resp(conn, 404, "Order not found")
    end
  end

  post("/api/create") do
    with %Plug.Conn{query_params: %{"key" => key, "value" => value}} <-
           Plug.Conn.fetch_query_params(conn),
         Server.Database.push(Db, {key, value}) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, "Added!")
    end
  end

  post("/api/delete") do
    with %Plug.Conn{query_params: %{"key" => key}} <- Plug.Conn.fetch_query_params(conn),
         :ok <- Server.Database.delete(Db, key) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, "deleted!")
    else
      _ -> send_resp(conn, 404, "No data found")
    end
  end

  post("/api/update") do
    with %Plug.Conn{query_params: %{"key" => key, "value" => value}} <-
           Plug.Conn.fetch_query_params(conn),
         :ok <- Server.Database.update(Db, {key, value}) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, "{updated: {#{key}, #{value}}}")
    end
  end

  get(_, do: send_file(conn, 200, "priv/static/index.html"))
  match(_, do: send_resp(conn, 404, "Not found"))
end
