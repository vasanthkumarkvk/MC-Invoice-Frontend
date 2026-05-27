'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { fmtRs, getCurrencySymbol } from '@/lib/data';

// ─── Initial state — empty, clean ─────────────────────────────────────────────
// Backend dev: replace these with API calls (useEffect + fetch)
const INIT = {
  // Auth
  user: null,           // null = not logged in
  profile: null,        // null = profile not set up

  // Business data — all empty arrays, populated by user actions
  customers:     [],
  vendors:       [],
  products:      [],
  invoices:      [],
  purchases:     [],
  estimates:     [],
  expenses:      [],
  indirectIncome:[],
  payments:      [],
  bankDetails:   [],
  prefixes:      ['INV-', 'MC-'],
  companyDetails: {},
  subUsers: [],
};

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(INIT);

  // ── Toast notifications ──────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Shortcuts panel ──────────────────────────────────────────────────────
  const [showShortcuts, setShowShortcuts] = useState(false);

  // ── User menu ────────────────────────────────────────────────────────────
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── Generic state updater ────────────────────────────────────────────────
  // Backend dev: replace calls to `update` with API calls, then update state
  const update = useCallback((key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // ── Login / logout ───────────────────────────────────────────────────────
  const login  = useCallback((user) => setState(prev => ({ ...prev, user })), []);
  const logout  = useCallback(() => setState(INIT), []);
  const setProfile = useCallback((profile) => setState(prev => ({ ...prev, profile })), []);

  // ── CRUD helpers — pure in-memory ────────────────────────────────────────
  const addItem = useCallback((key, item) => {
    setState(prev => {
      const arr   = prev[key] || [];
      const newId = arr.length ? Math.max(...arr.map(x => x.id || 0)) + 1 : 1;
      return { ...prev, [key]: [{ ...item, id: newId }, ...arr] };
    });
  }, []);

  const editItem = useCallback((key, updated) => {
    setState(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(x => x.id === updated.id ? updated : x),
    }));
  }, []);

  const removeItem = useCallback((key, id) => {
    setState(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(x => x.id !== id),
    }));
  }, []);

  // Currency-aware money formatter
  const currency = state.companyDetails?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);
  const fmtMoney = (n) => fmtRs(n, currency);

  return (
    <Ctx.Provider value={{
      state, update,
      login, logout, setProfile,
      addItem, editItem, removeItem,
      toasts, toast, dismissToast,
      sidebarOpen, setSidebarOpen,
      showShortcuts, setShowShortcuts,
      showUserMenu, setShowUserMenu,
      currency, currencySymbol, fmtMoney,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
