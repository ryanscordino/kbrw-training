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

  @impl true
  def init(_) do
    table = :ets.new(:kv_table, [:public, :named_table, read_concurrency: true])
    {:ok, table}
  end

  @impl true
  def handle_cast({:push, {key, value}}, _state) do
    :ets.insert_new(:kv_table, {key, value})
    {:noreply, {key, value}}
  end

  @impl true
  def handle_call({:get, key}, _from, state) do
    value = :ets.lookup(:kv_table, key)
    {:reply, value, state}
  end
end
