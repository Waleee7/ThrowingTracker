'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/lib/types';
import { storage } from '@/lib/storage';

export function useSessions() {
  const [sessions, setSessionsState] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSessionsState(storage.getSessions());
    setLoaded(true);
  }, []);

  const setSessions = useCallback((newSessions: Session[]) => {
    setSessionsState(newSessions);
    storage.setSessions(newSessions);
  }, []);

  const addSession = useCallback((session: Session) => {
    setSessionsState((prev) => {
      const updated = [...prev, session];
      storage.setSessions(updated);
      return updated;
    });
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessionsState((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      storage.setSessions(updated);
      return updated;
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessionsState((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      storage.setSessions(updated);
      return updated;
    });
  }, []);

  const reloadSessions = useCallback(() => {
    setSessionsState(storage.getSessions());
  }, []);

  return { sessions, setSessions, addSession, updateSession, deleteSession, reloadSessions, loaded };
}
