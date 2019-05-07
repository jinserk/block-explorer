/* https://overreacted.io/making-setinterval-declarative-with-react-hooks/ */
import { createContext, useState, useEffect, useRef } from 'react';

export const NetworkContext = createContext();

export function useSafeEffect(callback, deps) {
  useEffect(() => {
    let canceled = false;
    if (!canceled) return callback();
    return () => {
      canceled = true;
    }
  }, deps);
}

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function usePromise(promiseCallback, deps) {
  const savedCallback = useRef();
  const [resolved, setResolved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = promiseCallback;
  }, [promiseCallback]);

  const process = async () => {
    setLoading(true);
    try {
      const result = await savedCallback.current();
      setResolved(result);
      setError(null);
    } catch (e) {
      console.error(e);
      setResolved(null);
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    process();
  }, deps);

  return [loading, resolved, error];
}
