export async function queryPrometheus(
  address: string,
  query: string,
): Promise<any> {
  if (!address.endsWith("/api")) {
    address += "/api";
  }

  return fetch(`${address}/v1/query?query=${query}`).then(async (response) => {
    if (response.ok) return await response.json();
    throw new Error("1234567890");
  });
}
