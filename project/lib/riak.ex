defmodule Riak do
  # For the sake of the exercice, every bucket will be link with the bucket_name

  def schema_name, do: "ryan_scordino_orders_schema_2"
  def schema_file, do: "ryan_scordino_orders_schema_2.xml"
  def url, do: "https://kbrw-sb-tutoex-riak-gateway.kbrw.fr"
  def bucket_name, do: "ryan_scordino_orders"
  def index_name, do: "ryan_scordino_orders_index_2"

  def auth_header do
    username = "sophomore"
    password = "jlessthan3tutoex"
    auth = :base64.encode_to_string("#{username}:#{password}")
    [{~c"authorization", ~c"Basic #{auth}"}]
  end

  def initialize_commands() do
    case Riak.get_keys() do
      {:ok, keys} ->
        Enum.map(keys, fn key ->
          case Riak.get_object(key) do
            {:ok, object} ->
              updated_object = Map.put(object, "status", %{"state" => "init"})

              case Riak.put_object(key, Poison.encode!(updated_object)) do
                :ok -> {:ok, key}
                {:error, reason} -> {:error, {key, reason}}
              end

            {:error, reason} ->
              IO.puts("Failed to get object #{key}: #{inspect(reason)}")
              {:error, {key, reason}}
          end
        end)

      {:error, reason} ->
        IO.puts("Failed to get keys: #{inspect(reason)}")
        {:error, reason}
    end
  end

  def put_object(key, value) do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/keys/#{key}"
    headers = auth_header()
    content_type = ~c"application/json"
    body = value

    # https://www.erlang.org/docs/26/man/httpc#request-4
    case :httpc.request(:put, {url_str, headers, content_type, body}, [], []) do
      {:ok, {{_, 200, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, 201, _}, _headers, _body}} ->
        :ok

      # Weird, but still ok, because useful when you create a bucket for example
      {:ok, {{_, 204, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def get_buckets do
    url_str = ~c"#{url()}/buckets?buckets=true"
    headers = auth_header()

    case :httpc.request(:get, {url_str, headers}, [], []) do
      {:ok, {{_, 200, _}, _headers, body}} ->
        case Poison.decode(body) do
          {:ok, %{"buckets" => buckets}} -> {:ok, buckets}
          {:error, reason} -> {:error, reason}
        end

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Get the list of keys in a bucket
  def get_keys() do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/keys?keys=true"
    headers = auth_header()

    case :httpc.request(:get, {url_str, headers}, [], []) do
      {:ok, {{_, 200, _}, _headers, body}} ->
        case Poison.decode(body) do
          {:ok, %{"keys" => keys}} -> {:ok, keys}
          {:error, reason} -> {:error, reason}
        end

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def get_props_bucket() do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/props"
    headers = auth_header()

    case :httpc.request(:get, {url_str, headers}, [], []) do
      {:ok, {{_, 200, _}, _headers, body}} ->
        case Poison.decode(body) do
          {:ok, decoded_body} ->
            IO.inspect(decoded_body)
            {:ok, decoded_body}

          {:error, reason} ->
            {:error, reason}
        end

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Get the object corresponding to a key in a bucket
  def get_object(key) do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/keys/#{key}"
    headers = auth_header()

    case :httpc.request(:get, {url_str, headers}, [], []) do
      {:ok, {{_, 200, _}, _headers, body}} ->
        case Poison.decode(body) do
          {:ok, decoded_body} -> {:ok, decoded_body}
          # Return raw body if not JSON
          {:error, _} -> {:ok, body}
        end

      {:ok, {{_, 300, _}, _headers, _body}} ->
        {:error, :multiple_choices}

      {:ok, {{_, 404, _}, _headers, _body}} ->
        {:error, :not_found}

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Delete an object in a bucket
  def delete_object(key) do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/keys/#{key}"
    headers = auth_header()

    case :httpc.request(:delete, {url_str, headers}, [], []) do
      {:ok, {{_, 204, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, 404, _}, _headers, _body}} ->
        {:error, :not_found}

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def create_bucket() do
    put_object("first_key", "first_value")
  end

  # Upload a schema to Riak
  def upload_schema(schema_name, schema_content) do
    url_str = ~c"#{url()}/search/schema/#{schema_name}"
    headers = auth_header()
    content_type = ~c"application/xml"
    body = schema_content

    case :httpc.request(:put, {url_str, headers, content_type, body}, [], []) do
      {:ok, {{_, 204, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Create an index based on a schema
  def create_index(index_name, schema_name) do
    url_str = ~c"#{url()}/search/index/#{index_name}"
    headers = auth_header()
    content_type = ~c"application/json"
    body = Poison.encode!(%{"schema" => schema_name})

    case :httpc.request(:put, {url_str, headers, content_type, body}, [], []) do
      {:ok, {{_, 204, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Assign an index to a bucket
  def assign_index_to_bucket(index_name) do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/props"
    headers = auth_header()
    content_type = ~c"application/json"
    body = Poison.encode!(%{"props" => %{"search_index" => index_name}})

    case :httpc.request(:put, {url_str, headers, content_type, body}, [], []) do
      {:ok, {{_, 204, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Get the list of indexes
  def get_indexes do
    url_str = ~c"#{url()}/search/index"
    headers = auth_header()

    case :httpc.request(:get, {url_str, headers}, [], []) do
      {:ok, {{_, 200, _}, _headers, body}} ->
        case Poison.decode(body) do
          {:ok, decoded_body} -> {:ok, decoded_body}
          {:error, reason} -> {:error, reason}
        end

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def get_index_ryan do
    IO.inspect("Start fetch index")

    get_indexes()
    |> IO.inspect(label: "Fetched indexes")
    |> case do
      {:ok, indexes} ->
        case Enum.find(indexes, fn index -> index["name"] == index_name() end) do
          nil -> {:error, "Index not found"}
          index -> {:ok, index}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Empty a bucket (delete all keys)
  def empty_bucket() do
    case get_keys() do
      {:ok, keys} ->
        keys
        |> Enum.each(fn key -> delete_object(key) end)

        :ok

      {:error, reason} ->
        {:error, reason}
    end
  end

  def update_objects_index() do
    case get_keys() do
      {:ok, keys} ->
        results =
          keys
          |> Enum.map(fn key ->
            IO.inspect("Updating object for key: #{key}")

            case get_object(key) do
              {:ok, object} ->
                # Re-encode to JSON if it's not already a string
                json_body = if is_binary(object), do: object, else: Poison.encode!(object)

                case put_object(key, json_body) do
                  :ok ->
                    {:ok, key}

                  {:error, reason} ->
                    IO.puts("Failed to reindex object #{key}: #{inspect(reason)}")
                    {:error, {key, reason}}
                end

              {:error, reason} ->
                IO.puts("Failed to get object #{key}: #{inspect(reason)}")
                {:error, {key, reason}}
            end
          end)

        # Check if there were any failures
        failures =
          Enum.filter(results, fn
            {:error, _} -> true
            _ -> false
          end)

        if Enum.empty?(failures) do
          :ok
        else
          {:error, "Some objects failed to reindex: #{inspect(failures)}"}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Delete a bucket (empty it first, then remove props)
  def delete_bucket() do
    IO.puts("Emptying bucket first...")

    case empty_bucket() do
      :ok ->
        IO.puts("Bucket emptied, removing bucket properties...")

        url_str = ~c"#{url()}/buckets/#{bucket_name()}/props"
        headers = auth_header()
        content_type = ~c"application/json"
        # Set search_index to the sentinel value to disable indexing
        body = Poison.encode!(%{"props" => %{"search_index" => "_dont_index_"}})

        case :httpc.request(:put, {url_str, headers, content_type, body}, [], []) do
          {:ok, {{_, 204, _}, _headers, _body}} ->
            IO.puts("✓ Bucket properties reset successfully")
            :ok

          {:ok, {{_, status_code, _}, _headers, body}} ->
            {:error, "HTTP #{status_code}: #{body}"}

          {:error, reason} ->
            {:error, reason}
        end

      {:error, reason} ->
        IO.puts("Failed to empty bucket: #{inspect(reason)}")
        {:error, "Could not empty bucket: #{inspect(reason)}"}
    end
  end

  # Helper function to read schema from file and upload it
  def upload_schema_from_file(schema_name, file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        upload_schema(schema_name, content)

      {:error, reason} ->
        {:error, "Failed to read file: #{reason}"}
    end
  end

  # Search function for querying the index
  def search(
        index \\ index_name(),
        query \\ "*:*",
        page \\ 0,
        rows \\ 30,
        sort \\ "creation_date_index desc"
      ) do
    start = page * rows
    # URI encode the query and sort for URL safety
    encoded_query = URI.encode(query)

    url_str =
      if sort != "" do
        encoded_sort = URI.encode(sort)

        ~c"#{url()}/search/query/#{index}/?wt=json&q=#{encoded_query}&start=#{start}&rows=#{rows}&sort=#{encoded_sort}"
      else
        ~c"#{url()}/search/query/#{index}/?wt=json&q=#{encoded_query}&start=#{start}&rows=#{rows}"
      end

    IO.inspect(url_str, label: "Search URL")
    headers = auth_header()

    case :httpc.request(:get, {url_str, headers}, [], []) do
      {:ok, {{_, 200, _}, _headers, body}} ->
        case Poison.decode(body) do
          {:ok, decoded_body} -> {:ok, decoded_body}
          {:error, reason} -> {:error, reason}
        end

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Escape special characters in Lucene queries
  def escape(query) when is_binary(query) do
    # Lucene special characters that need escaping: + - && || ! ( ) { } [ ] ^ " ~ * ? : \ /
    # Note: We use %5C for backslash since it won't work directly in URLs
    query
    |> String.replace("\\", "%5C")
    |> String.replace("+", "\\+")
    |> String.replace("-", "\\-")
    |> String.replace("&&", "\\&&")
    |> String.replace("||", "\\||")
    |> String.replace("!", "\\!")
    |> String.replace("(", "\\(")
    |> String.replace(")", "\\)")
    |> String.replace("{", "\\{")
    |> String.replace("}", "\\}")
    |> String.replace("[", "\\[")
    |> String.replace("]", "\\]")
    |> String.replace("^", "\\^")
    |> String.replace("\"", "\\\"")
    |> String.replace("~", "\\~")
    |> String.replace("*", "\\*")
    |> String.replace("?", "\\?")
    |> String.replace(":", "\\:")
    |> String.replace("/", "\\/")
    |> String.replace(" ", "%20")
  end

  def escape(query), do: query

  # Helper function to completely reset and reindex the bucket
  def reset_and_reindex() do
    schema_name = schema_name()
    index_name = index_name()
    schema_file = schema_file()

    IO.puts("Step 1: Uploading corrected schema...")

    delete_bucket()

    schema_result =
      case upload_schema_from_file(schema_name, schema_file) do
        :ok ->
          IO.puts("✓ Schema uploaded successfully")
          :ok

        {:error, reason} ->
          IO.puts("✗ Schema upload failed: #{inspect(reason)}")
          {:error, reason}
      end

    # Wait a bit for schema to be processed
    Process.sleep(2000)

    IO.puts("Step 2: Creating/updating index...")

    index_result =
      case create_index(index_name, schema_name) do
        :ok ->
          IO.puts("✓ Index created successfully")
          :ok

        {:error, reason} ->
          IO.puts("✗ Index creation failed: #{inspect(reason)}")
          {:error, reason}
      end

    # Wait a bit for index to be processed
    Process.sleep(1000)

    IO.puts("Step 3: Assigning index to bucket...")

    assign_result =
      case assign_index_to_bucket(index_name) do
        :ok ->
          IO.puts("✓ Index assigned to bucket successfully")
          :ok

        {:error, reason} ->
          IO.puts("✗ Index assignment failed: #{inspect(reason)}")
          {:error, reason}
      end

    # Wait a bit for bucket props to be processed
    Process.sleep(2000)

    IO.puts("Step 4: Re-indexing all objects...")

    reindex_result =
      case update_objects_index() do
        :ok ->
          IO.puts("✓ All objects re-indexed successfully")
          :ok

        {:error, reason} ->
          IO.puts("✗ Object re-indexing failed: #{inspect(reason)}")
          {:error, reason}
      end

    IO.puts("Step 5: Waiting for indexing to complete...")
    Process.sleep(5000)

    # Collect all results
    results = [
      {:schema, schema_result},
      {:index, index_result},
      {:assign, assign_result},
      {:reindex, reindex_result}
    ]

    failures =
      Enum.filter(results, fn {_, result} ->
        case result do
          {:error, _} -> true
          _ -> false
        end
      end)

    if Enum.empty?(failures) do
      IO.puts("✓ Reset and reindexing complete! Try searching now.")
      :ok
    else
      IO.puts("⚠ Reset and reindexing completed with some errors:")

      Enum.each(failures, fn {step, {:error, reason}} ->
        IO.puts("  - #{step}: #{inspect(reason)}")
      end)

      {:partial_success, failures}
    end
  end
end
