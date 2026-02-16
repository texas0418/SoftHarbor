import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { JournalEntry, SharedStory } from '@/types/journal';
import { communityStories } from '@/mocks/shared-stories';

const JOURNAL_KEY = 'grief_journal_entries';
const SHARED_KEY = 'grief_shared_stories';
const ALIAS_KEY = 'grief_user_alias';

export const [JournalProvider, useJournal] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sharedStories, setSharedStories] = useState<SharedStory[]>(communityStories);
  const [userAlias, setUserAlias] = useState<string>('Anonymous');

  const entriesQuery = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(JOURNAL_KEY);
      return stored ? (JSON.parse(stored) as JournalEntry[]) : [];
    },
  });

  const sharedQuery = useQuery({
    queryKey: ['shared-stories'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SHARED_KEY);
      const userShared = stored ? (JSON.parse(stored) as SharedStory[]) : [];
      return [...communityStories, ...userShared];
    },
  });

  const aliasQuery = useQuery({
    queryKey: ['user-alias'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ALIAS_KEY);
      return stored || 'Anonymous';
    },
  });

  useEffect(() => {
    if (entriesQuery.data) setEntries(entriesQuery.data);
  }, [entriesQuery.data]);

  useEffect(() => {
    if (sharedQuery.data) setSharedStories(sharedQuery.data);
  }, [sharedQuery.data]);

  useEffect(() => {
    if (aliasQuery.data) setUserAlias(aliasQuery.data);
  }, [aliasQuery.data]);

  const persistEntries = useMutation({
    mutationFn: async (updated: JournalEntry[]) => {
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });

  const persistShared = useMutation({
    mutationFn: async (userShared: SharedStory[]) => {
      const onlyUser = userShared.filter((s) => s.isOwn);
      await AsyncStorage.setItem(SHARED_KEY, JSON.stringify(onlyUser));
      return userShared;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-stories'] });
    },
  });

  const persistAlias = useMutation({
    mutationFn: async (alias: string) => {
      await AsyncStorage.setItem(ALIAS_KEY, alias);
      return alias;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alias'] });
    },
  });

  const addEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'isShared'>) => {
      const newEntry: JournalEntry = {
        ...entry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isShared: false,
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      persistEntries.mutate(updated);
      return newEntry;
    },
    [entries, persistEntries]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood'>>) => {
      const updated = entries.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      setEntries(updated);
      persistEntries.mutate(updated);
    },
    [entries, persistEntries]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      persistEntries.mutate(updated);
      const updatedShared = sharedStories.filter((s) => s.journalId !== id);
      setSharedStories(updatedShared);
      persistShared.mutate(updatedShared);
    },
    [entries, sharedStories, persistEntries, persistShared]
  );

  const shareEntry = useCallback(
    (entryId: string) => {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) return;

      const updatedEntries = entries.map((e) =>
        e.id === entryId
          ? { ...e, isShared: true, sharedAt: new Date().toISOString() }
          : e
      );
      setEntries(updatedEntries);
      persistEntries.mutate(updatedEntries);

      const shared: SharedStory = {
        id: `shared-${Date.now()}`,
        journalId: entryId,
        title: entry.title,
        preview: entry.content.substring(0, 120) + '...',
        content: entry.content,
        mood: entry.mood,
        sharedAt: new Date().toISOString(),
        authorAlias: userAlias,
        hearts: 0,
        isOwn: true,
      };
      const updatedShared = [shared, ...sharedStories];
      setSharedStories(updatedShared);
      persistShared.mutate(updatedShared);
    },
    [entries, sharedStories, userAlias, persistEntries, persistShared]
  );

  const unshareEntry = useCallback(
    (entryId: string) => {
      const updatedEntries = entries.map((e) =>
        e.id === entryId ? { ...e, isShared: false, sharedAt: undefined } : e
      );
      setEntries(updatedEntries);
      persistEntries.mutate(updatedEntries);

      const updatedShared = sharedStories.filter((s) => s.journalId !== entryId);
      setSharedStories(updatedShared);
      persistShared.mutate(updatedShared);
    },
    [entries, sharedStories, persistEntries, persistShared]
  );

  const updateAlias = useCallback(
    (alias: string) => {
      setUserAlias(alias);
      persistAlias.mutate(alias);
    },
    [persistAlias]
  );

  const heartStory = useCallback(
    (storyId: string) => {
      const updated = sharedStories.map((s) =>
        s.id === storyId ? { ...s, hearts: s.hearts + 1 } : s
      );
      setSharedStories(updated);
      persistShared.mutate(updated);
    },
    [sharedStories, persistShared]
  );

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [entries]
  );

  return {
    entries: sortedEntries,
    sharedStories,
    userAlias,
    isLoading: entriesQuery.isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    shareEntry,
    unshareEntry,
    updateAlias,
    heartStory,
  };
});
