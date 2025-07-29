#!/usr/bin/env elixir

# Test script for Step 3 operations
IO.puts("Starting Step 3 operations...")

# 1. Create the bucket
IO.puts("1. Creating bucket...")

case Riak.create_bucket() do
  :ok -> IO.puts("   ✓ Bucket created successfully")
  {:error, reason} -> IO.puts("   ✗ Failed to create bucket: #{inspect(reason)}")
end

# 2. Upload the schema
IO.puts("2. Uploading schema...")
schema_name = "ryan_scordino_orders_schema"
schema_file = "ryan_scordino_orders_schema.xml"

case Riak.upload_schema_from_file(schema_name, schema_file) do
  :ok -> IO.puts("   ✓ Schema uploaded successfully")
  {:error, reason} -> IO.puts("   ✗ Failed to upload schema: #{inspect(reason)}")
end

# 3. Create the index
IO.puts("3. Creating index...")
index_name = "ryan_scordino_orders_index"

case Riak.create_index(index_name, schema_name) do
  :ok -> IO.puts("   ✓ Index created successfully")
  {:error, reason} -> IO.puts("   ✗ Failed to create index: #{inspect(reason)}")
end

# 4. Assign index to bucket
IO.puts("4. Assigning index to bucket...")

case Riak.assign_index_to_bucket(index_name) do
  :ok -> IO.puts("   ✓ Index assigned to bucket successfully")
  {:error, reason} -> IO.puts("   ✗ Failed to assign index to bucket: #{inspect(reason)}")
end

# 5. List indexes to verify
IO.puts("5. Listing indexes...")

case Riak.get_indexes() do
  {:ok, indexes} ->
    IO.puts("   ✓ Indexes retrieved successfully")
    IO.inspect(indexes, label: "   Available indexes")

  {:error, reason} ->
    IO.puts("   ✗ Failed to get indexes: #{inspect(reason)}")
end

IO.puts("Step 3 operations completed!")
