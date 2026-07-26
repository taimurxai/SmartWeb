"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useLiveApi(url, refreshInterval = 3000) {
  const [state, setState] = useState({ data: null, loading: Boolean(url), error: "" });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: "" });
      return;
    }
    setState((prev) => ({ ...prev, loading: !prev.data, error: "" }));

    let isMounted = true;
    let timer;

    async function fetchLive() {
      try {
        const res = await fetch(url);
        if (!isMounted) return;
        if (!res.ok) throw new Error(res.statusText || "Error fetching data");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setState({ data, loading: false, error: "" });
      } catch (err) {
        if (isMounted) setState({ data: null, loading: false, error: err.message });
      } finally {
        if (isMounted && refreshInterval > 0) {
          timer = setTimeout(fetchLive, refreshInterval);
        }
      }
    }

    fetchLive();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [url, refreshInterval]);

  return state;
}
