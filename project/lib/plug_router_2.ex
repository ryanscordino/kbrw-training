defmodule PlugRouter2 do
  use Server.TheCreator

  my_get "/" do
    {200, "Welcome to the new world of Plugs!"}
  end
end
