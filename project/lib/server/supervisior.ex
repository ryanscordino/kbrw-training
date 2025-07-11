defmodule Server.Supervisor do
  use Supervisor

  def start_link(init_args) do
    Supervisor.start_link(__MODULE__, init_args, name: __MODULE__)
  end

  @impl true
  def init([]) do
    children = [
      {Server.Database, []}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
