defmodule EwebmachineOrders.JSON do
  use Ewebmachine.Builder.Handlers
  plug(:cors)
  plug(:add_handlers, init: %{})

  content_types_provided(do: ["application/json": :to_json])

  defh to_json do
    case state[:json_obj] do
      nil -> Poison.encode!(%{error: "No data"})
      data -> Poison.encode!(data)
    end
  end

  defp cors(conn, _), do: put_resp_header(conn, "Access-Control-Allow-Origin", "*")
end
