'use client';

import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/lib/types';
import { storage } from '@/lib/storage';
import { DEFAULT_PROFILE } from '@/lib/constants';

export function useProfile() {
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.getProfile();
    if (saved) setProfileState(saved);
    setLoaded(true);
  }, []);

  const setProfile = useCallback((newProfile: Profile) => {
    setProfileState(newProfile);
    storage.setProfile(newProfile);
  }, []);

  return { profile, setProfile, loaded };
}
