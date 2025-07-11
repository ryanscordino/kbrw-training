defmodule MyGenericServer do
  def start_link(callback_module, server_inital_state \\ 0) do
    pid = spawn_link(fn -> loop(callback_module, server_inital_state) end)
    {:ok, pid}
  end

  def loop(callback_module, server_state) do
    receive do
      {:cast, _process_pid, req} ->
        new_state = callback_module.handle_cast(req, server_state)
        loop(callback_module, new_state)

      {:call, process_pid, req} ->
        current_state = callback_module.handle_call(req, server_state)
        send(process_pid, current_state)
        loop(callback_module, server_state)
    end
  end

  def cast(process_pid, req) do
    send(process_pid, {:cast, self(), req})
    :ok
  end

  def call(process_pid, req) do
    send(process_pid, {:call, self(), req})

    receive do
      res -> res
    end
  end
end
