export async function queryPrometheus(
  address: string,
  query: string,
): Promise<any> {
  if (!address.endsWith("/api")) {
    address = address.endsWith("/") ? `${address}api` : `${address}/api`;
  }

  const response = await fetch(`${address}/v1/query?query=${query}`);

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Error querying Prometheus: ${response.status} - ${response.statusText}`);
  }
}
