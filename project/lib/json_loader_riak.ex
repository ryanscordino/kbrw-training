defmodule JsonLoaderRiak do
  require Poison

  def load_to_riak(json_file) do
    with {:ok, body} <- File.read(json_file),
         {:ok, json} <- Poison.decode(body) do
      IO.puts("Loading #{length(json)} orders to Riak...")

      json
      |> Stream.chunk_every(50)
      |> Task.async_stream(
        fn chunk ->
          Enum.map(chunk, fn order ->
            key = Map.get(order, "id", Map.get(order, "id"))
            json_content = Poison.encode!(order)
            Riak.put_object(key, json_content)
          end)
        end,
        max_concurrency: 4,
        timeout: 30_000
      )
      |> Stream.run()

      IO.puts("✓ Orders loaded to Riak successfully")
      {:ok, :json_loaded}
    else
      {:error, reason} ->
        IO.puts("✗ Failed to read or parse JSON file: #{inspect(reason)}")
        {:error, reason}
    end
  end

  def load_orders_from_orders_chunk do
    files = ["data/orders_chunk0.json", "data/orders_chunk1.json"]

    for file <- files do
      case load_to_riak(file) do
        {:ok, :json_loaded} ->
          IO.puts("✓ Successfully loaded orders from #{file}")

        {:error, reason} ->
          IO.puts("✗ Failed to load orders from #{file}: #{inspect(reason)}")
      end
    end
  end
end
