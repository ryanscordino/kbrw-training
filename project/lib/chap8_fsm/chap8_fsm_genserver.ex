defmodule FSM.GenServer do
  use GenServer

  @inactivity_timeout 5 * 60 * 1000

  def start_link(order_id) do
    case GenServer.start_link(__MODULE__, order_id,
           name: {:via, Registry, {FSM.Registry, order_id}}
         ) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, pid}} -> {:ok, pid}
    end
  end

  def process_payment(pid) do
    GenServer.call(pid, {:fsm_event, {:process_payment, []}})
  end

  def verify_payment(pid) do
    GenServer.call(pid, {:fsm_event, {:verification, []}})
  end

  def get_state(pid) do
    GenServer.call(pid, :get_state)
  end

  def get_order(pid) do
    GenServer.call(pid, :get_order)
  end

  # Return a PID that points to the riak object
  @impl true
  def init(order_id) do
    case Riak.get_object(order_id) do
      {:ok, order_object} ->
        {:ok, %{order_id: order_id, order: order_object}, @inactivity_timeout}

      {:error, reason} ->
        {:stop, {:error, reason}}
    end
  end

  @impl true
  def handle_call({:fsm_event, event}, _from, %{order_id: order_id, order: order} = state) do
    case ExFSM.Machine.event(order, event) do
      {:next_state, updated_order} ->
        case Riak.put_object(order_id, Poison.encode!(updated_order)) do
          :ok ->
            new_state_name = ExFSM.Machine.State.state_name(updated_order)
            {:reply, {:ok, new_state_name}, %{state | order: updated_order}, @inactivity_timeout}

          {:error, reason} ->
            {:reply, {:error, reason}, state, @inactivity_timeout}
        end

      # {:next_state, new_state_name, updated_order} ->
      #   case Riak.put_object(order_id, Poison.encode!(updated_order)) do
      #     :ok ->
      #       {:reply, {:ok, new_state_name}, %{state | order: updated_order}}

      #     {:error, reason} ->
      #       {:reply, {:error, reason}, state}
      #   end

      {:error, reason} ->
        {:reply, {:error, reason}, state, @inactivity_timeout}
    end
  end

  @impl true
  def handle_call(:get_state, _from, %{order: order} = state) do
    current_state = ExFSM.Machine.State.state_name(order)
    {:reply, current_state, state, @inactivity_timeout}
  end

  @impl true
  def handle_call(:get_order, _from, %{order: order} = state) do
    {:reply, order, state, @inactivity_timeout}
  end

  @impl true
  def handle_info(:timeout, %{order_id: order_id} = state) do
    IO.puts("GenServer for order #{order_id} shutting down due to inactivity")
    {:stop, :timeout, state}
  end

  @impl true
  def terminate(reason, _state) do
    case reason do
      :timeout ->
        IO.puts("GenServer terminated due to inactivity timeout")

      _ ->
        IO.puts("GenServer terminated")
    end

    # IO.inspect(reason, label: "Reason")
    # IO.inspect(state, label: "State")
  end
end
