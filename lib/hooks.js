"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Subscribes to a single Firestore document in real time — no polling, no
// manual refresh. Any write to this doc (from this client, another tab, an
// admin console, or a Cloud Function) pushes a new snapshot immediately.
// Pass a falsy docId to skip subscribing, e.g. before the user has picked
// which document to watch.
export function useFirestoreDoc(collectionName, docId) {
  const [state, setState] = useState({ data: null, loading: Boolean(docId), error: "" });

  useEffect(() => {
    if (!docId) {
      setState({ data: null, loading: false, error: "" });
      return;
    }
    setState({ data: null, loading: true, error: "" });

    const ref = doc(firestore, collectionName, docId);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setState({ data: snap.exists() ? { id: snap.id, ...snap.data() } : null, loading: false, error: "" });
      },
      (err) => {
        setState({ data: null, loading: false, error: err.message });
      }
    );

    return unsubscribe;
  }, [collectionName, docId]);

  return state;
}
