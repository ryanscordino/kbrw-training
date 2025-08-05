defmodule Project.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {Registry, keys: :unique, name: FSM.Registry},
      Server.Supervisor,
      # {Plug.Cowboy, scheme: :http, plug: PlugRouter2, options: [port: 4041]},
      # {Plug.Cowboy, scheme: :http, plug: Router3, options: [port: 4040]}
      {Plug.Cowboy, scheme: :http, plug: RouterReact, options: [port: 4040]}
      # FSM.GenServer

    ]

    Application.put_env(
      :reaxt,
      :global_config,
      Map.merge(
        Application.get_env(:reaxt, :global_config),
        %{localhost: "http://0.0.0.0:4040"}
      )
    )

    Reaxt.reload()
    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Project.Supervisor]

    Supervisor.start_link(children, opts)
  end
end
