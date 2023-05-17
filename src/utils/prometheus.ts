import { PROMETHEUS_API_URL } from "../domain/constants";
import { getLocalStorageItem } from "./localstorage";

export async function queryPrometheus(query: string): Promise<any> {
  return fetch(
    `${
      getLocalStorageItem("CUSTOM_PROMETHEUS_API_URL") || PROMETHEUS_API_URL
    }/v1/query?query=${query}`
  ).then(async (response) => {
    if (response.ok) return await response.json();
    throw new Error();
  });
}
