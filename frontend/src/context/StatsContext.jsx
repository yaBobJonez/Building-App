/**
 * ARCHON Construction Suite — Global Stats Context
 *
 * Provides the four counters used in the Dashboard "Overview" section:
 *   total · active (In Progress) · completed (Done) · pending
 *
 * Usage:
 *   // Wrap the app (or just the Dashboard subtree):
 *   <StatsProvider pollInterval={60_000}>
 *     <App />
 *   </StatsProvider>
 *
 *   // Read state anywhere inside the tree:
 *   const { stats, loading, error, refresh } = useStats();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { fetchProjectStats } from "../services/api";

// ── State shape ───────────────────────────────────────────────────────────────
/**
 * @typedef {Object} StatsState
 * @property {import('../types').ProjectStats|null} stats
 * @property {boolean} loading
 * @property {string|null} error
 */

/** @type {StatsState} */
const initialState = { stats: null, loading: false, error: null };

// ── Reducer ───────────────────────────────────────────────────────────────────
/**
 * @param {StatsState} state
 * @param {{ type: 'FETCH_START'|'FETCH_SUCCESS'|'FETCH_ERROR', payload?: any }} action
 * @returns {StatsState}
 */
function statsReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { stats: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
/**
 * Default value satisfies the shape so TypeScript/IDEs don't complain
 * when the context is read outside a provider during testing.
 *
 * @type {React.Context<import('../types').StatsContextValue>}
 */
const StatsContext = createContext({
  stats: null,
  loading: false,
  error: null,
  refresh: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
/**
 * Fetches ProjectStats from GET /api/v1/stats on mount and exposes the
 * result (plus loading / error state) to all descendant components.
 *
 * The stats object maps directly to the four cards in the Dashboard
 * Overview grid: total, active (In Progress), completed (Done), pending.
 *
 * @param {{
 *   children: React.ReactNode,
 *   pollInterval?: number   // ms between automatic re-fetches; omit to disable
 * }} props
 */
export function StatsProvider({ children, pollInterval }) {
  const [state, dispatch] = useReducer(statsReducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await fetchProjectStats(); // GET /api/v1/stats
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optional polling (e.g. every 60 s to keep the Overview grid live)
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return;
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [refresh, pollInterval]);

  return (
    <StatsContext.Provider value={{ ...state, refresh }}>
      {children}
    </StatsContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * Read global ProjectStats inside any component wrapped by <StatsProvider>.
 *
 * Returned stats fields and their Dashboard equivalents:
 *   stats.total      → "Total Projects" card
 *   stats.active     → "In Progress" card
 *   stats.completed  → "Completed" card
 *   stats.pending    → "Pending" card
 *
 * @returns {import('../types').StatsContextValue}
 *
 * @example
 * const { stats, loading, error, refresh } = useStats();
 * if (loading) return <Spinner />;
 * return <div>{stats.total} projects</div>;
 */
export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) {
    throw new Error(
      "useStats() must be called inside a <StatsProvider>. " +
        "Wrap your Dashboard (or App root) with <StatsProvider>.",
    );
  }
  return ctx;
}

export default StatsContext;
