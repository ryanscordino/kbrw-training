# Test script for Step 5 - Search functionality

# Load dependencies
Application.put_env(:logger, :level, :warning)

# Compile the project
Code.eval_file("lib/riak.ex")

index_name = "ryan_scordino_orders_index"

IO.puts("=== Testing Riak Search Functionality ===")

# Test 1: Basic search for all orders
IO.puts("\n1. Testing search for all orders...")

case Riak.search(index_name, "*:*", 0, 5) do
  {:ok, %{"response" => response}} ->
    IO.puts("✅ Search successful!")
    IO.puts("Total found: #{response["numFound"]}")
    IO.puts("Returned: #{length(response["docs"])}")

    # Show first few keys
    keys = response["docs"] |> Enum.map(fn doc -> doc["_yz_rk"] end) |> Enum.take(3)
    IO.puts("Sample keys: #{inspect(keys)}")

  {:error, reason} ->
    IO.puts("❌ Search failed: #{inspect(reason)}")
end

# Test 2: Search for specific order type
IO.puts("\n2. Testing search for nat_order type...")

case Riak.search(index_name, "type:nat_order", 0, 5) do
  {:ok, %{"response" => response}} ->
    IO.puts("✅ Type search successful!")
    IO.puts("Found #{response["numFound"]} nat_order entries")

  {:error, reason} ->
    IO.puts("❌ Type search failed: #{inspect(reason)}")
end

# Test 3: Test escaping function
IO.puts("\n3. Testing escape function...")

test_queries = [
  "customer:John Doe",
  "amount:[100 TO 200]",
  "status:pending AND type:nat_order",
  "customer:\"John Smith\"",
  "notes:test*"
]

test_queries
|> Enum.each(fn query ->
  escaped = Riak.escape(query)
  IO.puts("Original: #{query}")
  IO.puts("Escaped:  #{escaped}")
  IO.puts("")
end)

# Test 4: Pagination test
IO.puts("4. Testing pagination...")
# Page 1, 3 items per page
case Riak.search(index_name, "*:*", 1, 3) do
  {:ok, %{"response" => response}} ->
    IO.puts("✅ Pagination test successful!")
    IO.puts("Page 1 returned #{length(response["docs"])} items")

  {:error, reason} ->
    IO.puts("❌ Pagination test failed: #{inspect(reason)}")
end

IO.puts("\n=== Test Complete ===")
