defmodule JsonLoader do
  alias Server.Database
  require Poison

  def load_to_database(database, json_file) do
    with {:ok, body} <- File.read(json_file), {:ok, json} <- Poison.decode(body) do
      Enum.map(json, fn elem ->
        Database.push(database, {Map.get(elem, "id"), elem})
      end)
    end
  end
end
