defmodule Server.Database do
  use GenServer

  def start_link([]) do
    GenServer.start_link(__MODULE__, [], name: Db)
  end

  def push(pid, {key, value}) do
    GenServer.cast(pid, {:push, {key, value}})
  end

  def push(_, _), do: {:error, :wrong_data}

  def get(pid, key) when is_binary(key) do
    GenServer.call(pid, {:get, key})
  end

  def delete(pid, key) do
    GenServer.cast(pid, {:delete, key})
  end

  def search(pid, criteria) when is_list(criteria) or is_map(criteria) do
    GenServer.call(pid, {:search, criteria})
  end

  def get_all(pid) do
    GenServer.call(pid, :get_all)
  end

  def get_first_n(pid, n) when is_integer(n) do
    GenServer.call(pid, {:get_first_n, n})
  end

  def update(pid, {key, value}) do
    GenServer.cast(pid, {:update, {key, value}})
  end

  @impl true
  def init(_) do
    table = :ets.new(:kv_table, [:public, :named_table, read_concurrency: true])
    JsonLoader.load_to_database(Db, "data/orders_chunk0.json")
    {:ok, table}
  end

  @impl true
  def handle_cast({:push, {key, value}}, _state) do
    :ets.insert_new(:kv_table, {key, value})
    {:noreply, {key, value}}
  end

  @impl true
  def handle_cast({:delete, key}, _state) do
    :ets.delete(:kv_table, key)
    {:noreply, key}
  end

  @impl true
  def handle_cast({:update, {key, value}}, _state) do
    with __MODULE__.delete(Db, key) do
      __MODULE__.push(Db, {key, value})
      {:noreply, {key, value}}
    end
  end

  @impl true
  def handle_call({:get, key}, _from, state) do
    value = :ets.lookup(:kv_table, key)
    {:reply, value, state}
  end

  @impl true
  def handle_call({:search, criterias}, _from, state) do
    with(criterias_formatted <- handle_params(criterias)) do
      order =
        Enum.reduce(criterias_formatted, [], fn criteria, acc ->
          case :ets.lookup(:kv_table, criteria) do
            [obj] ->
              [obj | acc]

            _ ->
              acc
          end
        end)

      IO.inspect(order)
      {:reply, order, state}
    end
  end

  @impl true
  def handle_call(:get_all, _from, state) do
    all_orders =
      :ets.tab2list(:kv_table)
      |> Enum.map(fn {_key, value} -> value end)

    {:reply, all_orders, state}
  end

  @impl true
  def handle_call({:get_first_n, n}, _from, state) do
    all_orders = :ets.tab2list(:kv_table)

    first_n_orders =
      all_orders
      |> Enum.map(fn {_key, value} -> value end)
      |> Enum.take(n)

    {:reply, first_n_orders, state}
  end

  defp handle_params(params) when is_map(params), do: Map.values(params)
  defp handle_params(params) when is_list(params), do: params
end
