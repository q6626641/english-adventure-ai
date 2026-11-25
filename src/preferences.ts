export function readPreference(key: string, fallback: boolean) {
  try {
    const saved = localStorage.getItem('english-adventure.' + key);
    return saved === null ? fallback : saved === 'true';
  } catch {
    return fallback;
  }
}

export function savePreference(key: string, value: boolean) {
  try {
    localStorage.setItem('english-adventure.' + key, String(value));
  } catch {
    // The session can still use the selected preference.
  }
}
