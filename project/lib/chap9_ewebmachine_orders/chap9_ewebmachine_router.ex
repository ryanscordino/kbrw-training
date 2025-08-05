defmodule EwebmachineOrders.Router do
  use Ewebmachine.Builder.Resources
  if Mix.env() == :dev, do: plug(Ewebmachine.Plug.Debug)
  resources_plugs(error_forwarding: "/error/:status", nomatch_404: true)
  plug(EwebmachineOrders.ErrorRoutes)

  plug(:resource_match)
  plug(Ewebmachine.Plug.Run)
  plug(Ewebmachine.Plug.Send)

  require EEx
  EEx.function_from_file(:def, :layout, "web/layout.html.eex", [:render])

  def parse_query_params(conn) do
    case conn.query_string do
      "" -> %{}
      query_string -> URI.decode_query(query_string)
    end
  end

  resource "/hello/:name" do
    %{name: name}
  after
    content_types_provided(do: ["application/json": :to_json])
    defh(to_json, do: Poison.encode!(%{message: "Hello #{state.name}"}))
  end

  resource "/static/*path" do
    %{path: Enum.join(path, "/")}
  after
    resource_exists(do: File.regular?(path(state.path)))
    content_types_provided(do: [{state.path |> Plug.MIME.path() |> default_plain, :to_content}])
    defh(to_content, do: File.stream!(path(state.path), [], 300_000_000))
    defp path(relative), do: "#{:code.priv_dir(:project)}/static/#{relative}"
    defp default_plain("application/octet-stream"), do: "text/plain"
    defp default_plain(type), do: type
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
    allowed_methods(do: ["GET"])
    content_types_provided(do: ["application/json": :to_json])
    plug(EwebmachineOrders.JSON)

    defh resource_exists do
      case Riak.get_object(state.id) do
        {:ok, order} ->
          IO.inspect(order)
          Poison.encode!(order)

        {:error, reason} ->
          Poison.encode!(%{error: reason})
      end
    end
  end

  # Catch-all route for React SPA - must be last!
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
