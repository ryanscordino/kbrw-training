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
    # Get query parameters for pagination and search
    conn = Plug.Conn.fetch_query_params(conn)
    page = String.to_integer(conn.query_params["page"] || "0")
    rows = String.to_integer(conn.query_params["rows"] || "30")
    search_query = conn.query_params["q"] || "*:*"  # Default to match all
    
    index_name = "ryan_scordino_orders_index"
    
    case Riak.search(index_name, search_query, page, rows, "creation_date_index desc") do
      {:ok, %{"response" => %{"docs" => docs, "numFound" => total}}} ->
        # Get full objects for each key found
        orders = docs
        |> Enum.map(fn doc -> doc["_yz_rk"] end)  # Extract Riak keys
        |> Enum.filter(& &1)  # Remove any nil keys
        |> Enum.map(fn key ->
          case Riak.get_object(key) do
            {:ok, order} -> order
            {:error, _} -> nil
          end
        end)
        |> Enum.filter(& &1)  # Remove any failed retrievals
        
        response = %{
          orders: orders,
          total: total,
          page: page,
          rows: rows
        }
        
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(response))
        
      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Poison.encode!(%{error: "Search failed: #{inspect(reason)}"}))
    end
  end

  get("/api/order/:id") do
    order_id = conn.path_params["id"]
    IO.inspect(order_id)

    case Riak.get_object(order_id) do
      {:ok, order} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(order))

      {:error, :not_found} ->
        send_resp(conn, 404, "Order not found")
        
      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Poison.encode!(%{error: "Failed to get order: #{inspect(reason)}"}))
    end
  end

  get("/api/search") do
    conn = Plug.Conn.fetch_query_params(conn)
    search_query = conn.query_params["q"] || "*:*"
    page = String.to_integer(conn.query_params["page"] || "0")
    rows = String.to_integer(conn.query_params["rows"] || "30")
    
    index_name = "ryan_scordino_orders_index"
    
    case Riak.search(index_name, search_query, page, rows, "creation_date_index desc") do
      {:ok, %{"response" => %{"docs" => docs, "numFound" => total}}} ->
        # Get full objects for each key found
        orders = docs
        |> Enum.map(fn doc -> doc["_yz_rk"] end)  # Extract Riak keys
        |> Enum.filter(& &1)  # Remove any nil keys
        |> Enum.map(fn key ->
          case Riak.get_object(key) do
            {:ok, order} -> order
            {:error, _} -> nil
          end
        end)
        |> Enum.filter(& &1)  # Remove any failed retrievals
        
        response = %{
          orders: orders,
          total: total,
          page: page,
          rows: rows,
          query: search_query
        }
        
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(response))
        
      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Poison.encode!(%{error: "Search failed: #{inspect(reason)}"}))
    end
  end

  delete("/api/order/:id") do
    order_id = conn.path_params["id"]
    # Simulate a delay for the delete operation
    :timer.sleep(500)

    case Riak.delete_object(order_id) do
      :ok ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(%{message: "Order deleted successfully"}))

      {:error, :not_found} ->
        send_resp(conn, 404, "Order not found")
        
      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Poison.encode!(%{error: "Failed to delete order: #{inspect(reason)}"}))
    end
  end

  post("/api/create") do
    conn = Plug.Conn.fetch_query_params(conn)
    
    case conn.query_params do
      %{"key" => key, "value" => value} ->
        # Encode value as JSON if it's not already
        json_value = if is_binary(value) do
          case Poison.decode(value) do
            {:ok, _} -> value  # Already valid JSON
            {:error, _} -> Poison.encode!(%{data: value})  # Wrap in JSON object
          end
        else
          Poison.encode!(value)
        end
        
        case Riak.put_object(key, json_value) do
          :ok ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Poison.encode!(%{message: "Added!"}))
            
          {:error, reason} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(500, Poison.encode!(%{error: "Failed to create: #{inspect(reason)}"}))
        end
        
      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, Poison.encode!(%{error: "Missing key or value parameter"}))
    end
  end

  # post("/api/delete") do
  #   with %Plug.Conn{query_params: %{"key" => key}} <- Plug.Conn.fetch_query_params(conn),
  #        :ok <- Server.Database.delete(Db, key) do
  #     conn
  #     |> put_resp_content_type("application/json")
  #     |> send_resp(200, "deleted!")
  #   else
  #     _ -> send_resp(conn, 404, "No data found")
  #   end
  # end

  post("/api/update") do
    conn = Plug.Conn.fetch_query_params(conn)
    
    case conn.query_params do
      %{"key" => key, "value" => value} ->
        # Encode value as JSON if it's not already
        json_value = if is_binary(value) do
          case Poison.decode(value) do
            {:ok, _} -> value  # Already valid JSON
            {:error, _} -> Poison.encode!(%{data: value})  # Wrap in JSON object
          end
        else
          Poison.encode!(value)
        end
        
        case Riak.put_object(key, json_value) do
          :ok ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Poison.encode!(%{message: "Updated!", key: key, value: value}))
            
          {:error, reason} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(500, Poison.encode!(%{error: "Failed to update: #{inspect(reason)}"}))
        end
        
      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, Poison.encode!(%{error: "Missing key or value parameter"}))
    end
  end

  get(_, do: send_file(conn, 200, "priv/static/index.html"))
  match(_, do: send_resp(conn, 404, "Not found"))
end
