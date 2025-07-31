defmodule HelloPort do
  use GenServer

  @moduledoc """
  A GenServer that communicates with a NodeJS server through Port.
  """

  # Client API
  def start_link(
        {cmd, init_state, opts} \\ {
          "node hello.js",
          0,
          [cd: "/Users/ryan.scordino/dev/kbrw-training/project/hello_port"]
        },
        name \\ __MODULE__
      ) do
    GenServer.start_link(__MODULE__, {cmd, init_state, opts}, name: name)
  end

  # Send Key-Value - adds the tuple to the state
  def send_kv({key, value} = kv, server \\ __MODULE__) when is_tuple(kv) do
    GenServer.cast(server, {:add_kv, {key, value}})
  end

  # Send a message - adds the message to the state
  def send_msg(msg, server \\ __MODULE__) when is_binary(msg) or is_atom(msg) do
    GenServer.cast(server, {:add_msg, msg})
  end

  # Get current state - returns all accumulated messages
  def get_state(server \\ __MODULE__) do
    GenServer.call(server, :get)
  end

  # https://www.erlang.org/doc/apps/erts/erlang.html#open_port/2
  @impl true
  def init({cmd, init_state, opts}) do
    port = Port.open({:spawn, ~c"#{cmd}"}, [:binary, :exit_status, packet: 4] ++ opts)
    send(port, {self(), {:command, :erlang.term_to_binary(init_state)}})
    {:ok, port}
  end

  # Handle info helps to manage if NodeJS fails or exits
  @impl true
  def handle_info({port, {:exit_status, 0}}, port), do: {:stop, :normal, port}

  @impl true
  def handle_info({port, {:exit_status, _}}, port), do: {:stop, :port_terminated, port}

  @impl true
  def handle_info(_msg, port), do: {:noreply, port}

  @impl true
  def handle_cast(term, port) do
    send(port, {self(), {:command, :erlang.term_to_binary(term)}})
    {:noreply, port}
  end

  @impl true
  def handle_call(term, _from, port) do
    send(port, {self(), {:command, :erlang.term_to_binary(term)}})

    res =
      receive do
        {^port, {:data, binary}} -> :erlang.binary_to_term(binary)
      end

    {:reply, res, port}
  end
end
