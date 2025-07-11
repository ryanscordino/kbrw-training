defmodule Server.TheCreator do
  # TODO: Look at https://github.com/elixir-plug/plug/blob/v1.18.1/lib/plug/router.ex#L1    
  # https://github.com/elixir-lang/elixir/blob/c1c8ebaa8f5b7aa69fff0ade6aa035fbb65f6eeb/lib/ex_unit/lib/ex_unit/case.ex#L570

  defmacro __using__(_) do
    quote do
      import Plug.Conn
      import Server.TheCreator

      @routes []

      @before_compile Server.TheCreator

      def init(opts), do: opts
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      def call(%Plug.Conn{} = conn, _opts) do
        if String.to_atom(conn.request_path) in @routes do
          apply(__MODULE__, String.to_atom(conn.request_path), [conn])
        else
          apply(__MODULE__, :error_path, [conn])
        end
      end
    end
  end

  defmacro my_get(path, do: {200, text} = _block) do
    get_route = String.to_atom(path)

    quote do
      @routes [unquote(get_route) | @routes]
      def unquote(get_route)(conn) do
        conn
        |> put_resp_content_type("text/plain")
        |> send_resp(200, unquote(text))
      end
    end
  end

  defmacro my_error(code: code, content: content) do
    quote do
      def unquote(:error_path)(conn) do
        conn
        |> put_resp_content_type("text/plain")
        |> send_resp(unquote(code), unquote(content))
      end
    end
  end
end
