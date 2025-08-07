defmodule EwebmachineOrders.Router do
  use Ewebmachine.Builder.Resources
  if Mix.env() == :dev, do: plug(Ewebmachine.Plug.Debug)
  resources_plugs(error_forwarding: "/error/:status", nomatch_404: true)
  plug(EwebmachineOrders.ErrorRoutes)

  require EEx
  EEx.function_from_file(:def, :layout, "web/layout.html.eex", [:render])

  resource "/public/*path" do
    %{path: Enum.join(path, "/")}
  after
    resource_exists(do: File.regular?(path(state.path)))
    content_types_provided(do: [{state.path |> Plug.MIME.path() |> default_plain, :to_content}])
    defh(to_content, do: File.stream!(path(state.path), [], 300_000_000))
    defp path(relative), do: "#{:code.priv_dir(:project)}/static/#{relative}"
    defp default_plain("application/octet-stream"), do: "text/plain"
    defp default_plain(type), do: type
  end

  def parse_query_params(conn) do
    case conn.query_string do
      "" -> %{}
      query_string -> URI.decode_query(query_string)
    end
  end

  resource "/hello/:name" do
    %{name: name}
  after
    allowed_methods(do: ["GET"])
    content_types_provided(do: ["application/json": :to_json])
    defh(to_json, do: Poison.encode!(%{message: "Hello #{state.name}"}))
  end

  resource "/api/orders" do
    %{}
  after
    allowed_methods(do: ["GET"])
    content_types_provided(do: ["application/json": :to_json])

    defh to_json do
      query_params = EwebmachineOrders.Router.parse_query_params(var!(conn))

      page = String.to_integer(query_params["page"] || "0")
      rows = String.to_integer(query_params["rows"] || "10")
      search_query = query_params["search"] || "*:*"

      index_name = Riak.index_name()

      case Riak.search(index_name, search_query, page, rows, "creation_date_index desc") do
        {:ok, %{"response" => %{"docs" => _docs, "numFound" => 0}}} ->
          # No results found
          Poison.encode!(%{orders: %{value: [], total: 0, page: page, rows: rows}})

        {:ok, %{"response" => %{"docs" => docs, "numFound" => total}}} ->
          IO.inspect(total)

          orders =
            docs
            # Extract Riak keys
            |> Enum.map(fn doc -> doc["_yz_rk"] end)
            # Remove any nil keys
            |> Enum.filter(& &1)
            |> Enum.map(fn key ->
              case Riak.get_object(key) do
                {:ok, order} -> order
                {:error, _} -> nil
              end
            end)
            # Remove any failed retrievals
            |> Enum.filter(& &1)

          response = %{
            orders: %{
              value: orders,
              total: total,
              page: page,
              rows: rows
            }
          }

          Poison.encode!(response)

        {:error, reason} ->
          IO.puts(reason)
          Poison.encode!(%{orders: %{value: [], total: 0, page: page, rows: rows}})
      end
    end
  end

  resource "/api/order/:id" do
    %{id: id}
  after
    allowed_methods(do: ["GET", "DELETE"])
    content_types_provided(do: ["application/json": :to_json])

    resource_exists do
      case Riak.get_object(state.id) do
        {:ok, order} ->
          pass(true, order: order)

        {:error, :not_found} ->
          false

        {:error, _reason} ->
          false
      end
    end

    delete_resource do
      # Simulate a delay for the delete operation
      :timer.sleep(500)

      case Riak.delete_object(state.id) do
        :ok ->
          pass(true, message: "Order deleted successfully")

        {:error, :not_found} ->
          false

        {:error, reason} ->
          pass(false, error: "Failed to delete order: #{inspect(reason)}")
      end
    end

    defh to_json do
      IO.inspect(state.order)

      cond do
        Map.has_key?(state, :order) ->
          Poison.encode!(state.order)

        Map.has_key?(state, :message) ->
          Poison.encode!(%{message: state.message})

        Map.has_key?(state, :error) ->
          Poison.encode!(%{error: state.error})

        true ->
          Poison.encode!(%{error: "Order not found"})
      end
    end
  end

  resource "/api/create" do
    %{}
  after
    allowed_methods(do: ["POST"])
    content_types_provided(do: ["application/json": :to_json])

    process_post do
      query_params = EwebmachineOrders.Router.parse_query_params(var!(conn))

      case query_params do
        %{"key" => key, "value" => value} ->
          # Encode value as JSON if it's not already
          json_value =
            if is_binary(value) do
              case Poison.decode(value) do
                # Already valid JSON
                {:ok, _} -> value
                # Wrap in JSON object
                {:error, _} -> Poison.encode!(%{data: value})
              end
            else
              Poison.encode!(value)
            end

          case Riak.put_object(key, json_value) do
            :ok ->
              pass(true, message: "Added!")

            {:error, reason} ->
              pass(false, error: "Failed to create: #{inspect(reason)}")
          end

        _ ->
          pass(false, error: "Missing key or value parameter")
      end
    end

    defh to_json do
      cond do
        Map.has_key?(state, :message) ->
          Poison.encode!(%{message: state.message})

        Map.has_key?(state, :error) ->
          Poison.encode!(%{error: state.error})

        true ->
          Poison.encode!(%{error: "Unknown error"})
      end
    end
  end

  resource "/api/update" do
    %{}
  after
    allowed_methods(do: ["POST"])
    content_types_provided(do: ["application/json": :to_json])

    process_post do
      query_params = EwebmachineOrders.Router.parse_query_params(var!(conn))

      case query_params do
        %{"key" => key, "value" => value} ->
          # Encode value as JSON if it's not already
          json_value =
            if is_binary(value) do
              case Poison.decode(value) do
                # Already valid JSON
                {:ok, _} -> value
                # Wrap in JSON object
                {:error, _} -> Poison.encode!(%{data: value})
              end
            else
              Poison.encode!(value)
            end

          case Riak.put_object(key, json_value) do
            :ok ->
              pass(true, message: "Updated!", key: key, value: value)

            {:error, reason} ->
              pass(false, error: "Failed to update: #{inspect(reason)}")
          end

        _ ->
          pass(false, error: "Missing key or value parameter")
      end
    end

    defh to_json do
      cond do
        Map.has_key?(state, :message) ->
          Poison.encode!(%{message: state.message, key: state[:key], value: state[:value]})

        Map.has_key?(state, :error) ->
          Poison.encode!(%{error: state.error})

        true ->
          Poison.encode!(%{error: "Unknown error"})
      end
    end
  end

  resource "/api/order/:id/payment" do
    %{id: id}
  after
    allowed_methods(do: ["POST"])
    content_types_provided(do: ["application/json": :to_json])

    process_post do
      IO.inspect(state.id, label: "Processing payment for order")

      case FSM.GenServer.start_link(state.id) do
        {:ok, pid} ->
          IO.inspect(pid, label: "GenServer started/found")

          case FSM.GenServer.process_payment(pid) do
            {:ok, new_state} ->
              IO.inspect(new_state, label: "Payment processed successfully")
              pass(true, message: "Payment processed", payment_state: new_state)

            {:error, reason} ->
              IO.inspect(reason, label: "Failed to process payment")
              pass(false, error: "Failed to process payment: #{inspect(reason)}")
          end

        {:error, reason} ->
          IO.inspect(reason, label: "Failed to start FSM GenServer")
          pass(false, error: "Failed to start FSM: #{inspect(reason)}")
      end
    end

    defh to_json do
      cond do
        Map.has_key?(state, :message) ->
          Poison.encode!(%{message: state.message, state: state[:payment_state]})

        Map.has_key?(state, :error) ->
          Poison.encode!(%{error: state.error})

        true ->
          Poison.encode!(%{error: "Unknown error"})
      end
    end
  end

  resource "/*path" do
    %{path: Enum.join(path, "/")}
  after
    allowed_methods(do: ["GET"])
    content_types_provided(do: ["text/html": :to_html])

    defh to_html do
      conn = var!(conn)
      query_params = EwebmachineOrders.Router.parse_query_params(conn)

      render =
        Reaxt.render!(
          :app,
          %{path: conn.request_path, cookies: conn.cookies, query: query_params},
          30_000
        )

      EwebmachineOrders.Router.layout(render)
    end
  end
end
