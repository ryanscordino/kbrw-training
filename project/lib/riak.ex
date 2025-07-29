defmodule Riak do
  # For the sake of the exercice, every bucket will be link with the bucket_name

  def url, do: "https://kbrw-sb-tutoex-riak-gateway.kbrw.fr"
  def bucket_name, do: "ryan_scordino_bucket"

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

  # Create a bucket by putting a dummy object (as mentioned in the chapter)
  def create_bucket() do
    put_object("first_key", "first_value")
  end
end
