export async function queryPrometheus(query: string): Promise<any> {
  const response = await fetch(
    `http://localhost:9090/api/v1/query?query=${query}`
  );
  const data = await response.json();
  return data;
}
