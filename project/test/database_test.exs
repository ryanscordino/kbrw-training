defmodule DatabaseTest do
  alias Server.Database

  use ExUnit.Case, async: true

  describe "start_link/1" do
    test "should be already started" do
      assert({:error, {:already_started, _}} = Database.start_link([]))
    end
  end

  describe "push/2" do
    test "should add an element with a valid {key, value} object" do
      assert(:ok = Database.push(Db, {"key", "value"}))
    end

    test "shouldnt add an element if the {key, value} object is not valid" do
      assert({:error, :wrong_data} = Database.push(Db, "only_key"))
    end
  end

  describe "get/2" do
    test "should get a {key, value} returned" do
      key = "key_test"
      Database.push(Db, {key, "value_test"})

      assert([{"key_test", "value_test"}] = Database.get(Db, key))
    end

    test "should return an empty list if nothing has been pushed" do
      assert([] = Database.get(Db, "test"))
    end
  end
end
