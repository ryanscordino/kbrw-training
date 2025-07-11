defmodule PlugRouter do
  import Plug.Conn

  def init(opts) do
    opts
  end

  def call(%Plug.Conn{request_path: "/"} = conn, _opts) do
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "Welcome to the new world of Plugs")
  end

  def call(%Plug.Conn{request_path: "/me"} = conn, _opts) do
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(
      200,
      "I am The First, The One, Le Geant Plug Vert, Le Grand Plug, Le Plug Cosmique."
    )
  end

  def call(%Plug.Conn{} = conn, _opts) do
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(404, "Go away, you are not welcome here")
  end
end
