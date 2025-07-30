defmodule Riak do
  # For the sake of the exercice, every bucket will be link with the bucket_name

  def url, do: "https://kbrw-sb-tutoex-riak-gateway.kbrw.fr"
  def bucket_name, do: "ryan_scordino_orders"

  def auth_header do
    username = "sophomore"
    password = "jlessthan3tutoex"
    auth = :base64.encode_to_string("#{username}:#{password}")
    [{~c"authorization", ~c"Basic #{auth}"}]
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
        {:error, :multiples_choices}

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

  # Delete a bucket (remove props, effectively "deleting" it)
  def delete_bucket() do
    url_str = ~c"#{url()}/buckets/#{bucket_name()}/props"
    headers = auth_header()

    case :httpc.request(:delete, {url_str, headers}, [], []) do
      {:ok, {{_, 204, _}, _headers, _body}} ->
        :ok

      {:ok, {{_, status_code, _}, _headers, body}} ->
        {:error, "HTTP #{status_code}: #{body}"}

      {:error, reason} ->
        {:error, reason}
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
  def search(index, query, page \\ 0, rows \\ 30, sort \\ "creation_date_index desc") do
    start = page * rows
    # URI encode the query and sort for URL safety
    encoded_query = URI.encode(query)
    encoded_sort = URI.encode(sort)

    url_str = "#{url()}/search/query/#{index}/?wt=json&q=#{encoded_query}&start=#{start}&rows=#{rows}&sort=#{encoded_sort}"
    url_charlist = String.to_charlist(url_str)
    headers = auth_header()

    case :httpc.request(:get, {url_charlist, headers}, [], []) do
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
end
