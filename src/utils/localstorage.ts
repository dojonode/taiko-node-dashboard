export function setLocalStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Error setting "${key}" in localStorage:`, e);
  }
}

export function getLocalStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`Error getting "${key}" from localStorage:`, e);
    return null;
  }
}
