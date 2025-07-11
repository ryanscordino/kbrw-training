defmodule Server.TheCreator do
  # TODO: Look at https://github.com/elixir-plug/plug/blob/v1.18.1/lib/plug/router.ex#L1    
  # https://github.com/elixir-lang/elixir/blob/c1c8ebaa8f5b7aa69fff0ade6aa035fbb65f6eeb/lib/ex_unit/lib/ex_unit/case.ex#L570

  defmacro __using__ do
    quote do
      import Plug.Conn
      import Server.TheCreator

      @routes []

      @before_compile Server.TheCreator
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      def init(opts), do: opts

      def call(%Plug.Conn{} = conn, _opts) do
        conn
        |> put_resp_content_type("text/plain")
      end

      Enum.each(@routes, fn route ->
        apply(__MODULE__, route, [])
      end)
    end
  end

  defmacro my_get(path, do: {200, text} = _block) do
    get_route = String.to_atom("my_get" <> path)

    quote do
      @routes [unquote(get_route) | @routes]
      def unquote(get_route)(unquote(path)) do
        call(%Plug.Conn{request_path: unquote(path) = conn})
        {code, resp} = send_resp(conn, 200, unquote(text))
      end
    end
  end
end

