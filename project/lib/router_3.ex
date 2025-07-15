defmodule Router3 do
  @moduledoc """
  This module build a router which interacts with the `:kv_table`. Because some of the funcions here are extented by macro, we can't document them direclty. We are going to describe them directly here.

  `get(/search)`
  Search values from a list of params. Be careful! If you put a duplicate key (two times the same key), one is going to be replace by the others. 
  """

  use Plug.Router
  require Poison

  plug(:match)

  plug(:dispatch)

  get("/search") do
    with %Plug.Conn{query_params: params} <- Plug.Conn.fetch_query_params(conn),
         [{_id, response}] <- Server.Database.search(Db, params) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, JSON.encode!(response))
    else
      _ -> send_resp(conn, 404, "No data found")
    end
  end

  post("/create") do
    with %Plug.Conn{query_params: %{"key" => key, "value" => value}} <-
           Plug.Conn.fetch_query_params(conn),
         Server.Database.push(Db, {key, value}) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, "Added!")
    end
  end

  post("/delete") do
    with %Plug.Conn{query_params: %{"key" => key}} <- Plug.Conn.fetch_query_params(conn),
         :ok <- Server.Database.delete(Db, key) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, "deleted!")
    else
      _ -> send_resp(conn, 404, "No data found")
    end
  end

  post("/update") do
    with %Plug.Conn{query_params: %{"key" => key, "value" => value}} <-
           Plug.Conn.fetch_query_params(conn),
         :ok <- Server.Database.update(Db, {key, value}) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, "{updated: {#{key}, #{value}}}")
    end
  end

  match(_, do: send_resp(conn, 404, "Not found"))
end
