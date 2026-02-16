import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { MoodCheckIn, Milestone, Favorite, CommunityPost } from '@/types/app';
import { initialCommunityPosts } from '@/mocks/community';

const CHECKINS_KEY = 'grief_mood_checkins';
const MILESTONES_KEY = 'grief_milestones';
const FAVORITES_KEY = 'grief_favorites';
const COMMUNITY_KEY = 'grief_community';

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [checkIns, setCheckIns] = useState<MoodCheckIn[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts);

  const checkInsQuery = useQuery({
    queryKey: ['mood-checkins'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHECKINS_KEY);
      return stored ? (JSON.parse(stored) as MoodCheckIn[]) : [];
    },
  });

  const milestonesQuery = useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MILESTONES_KEY);
      return stored ? (JSON.parse(stored) as Milestone[]) : [];
    },
  });

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      return stored ? (JSON.parse(stored) as Favorite[]) : [];
    },
  });

  const communityQuery = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(COMMUNITY_KEY);
      const userPosts = stored ? (JSON.parse(stored) as CommunityPost[]) : [];
      return [...userPosts, ...initialCommunityPosts];
    },
  });

  useEffect(() => {
    if (checkInsQuery.data) setCheckIns(checkInsQuery.data);
  }, [checkInsQuery.data]);

  useEffect(() => {
    if (milestonesQuery.data) setMilestones(milestonesQuery.data);
  }, [milestonesQuery.data]);

  useEffect(() => {
    if (favoritesQuery.data) setFavorites(favoritesQuery.data);
  }, [favoritesQuery.data]);

  useEffect(() => {
    if (communityQuery.data) setCommunityPosts(communityQuery.data);
  }, [communityQuery.data]);

  const persistCheckIns = useMutation({
    mutationFn: async (updated: MoodCheckIn[]) => {
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mood-checkins'] }),
  });

  const persistMilestones = useMutation({
    mutationFn: async (updated: Milestone[]) => {
      await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones'] }),
  });

  const persistFavorites = useMutation({
    mutationFn: async (updated: Favorite[]) => {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const persistCommunity = useMutation({
    mutationFn: async (userPosts: CommunityPost[]) => {
      const onlyUser = userPosts.filter((p) => p.isOwn);
      await AsyncStorage.setItem(COMMUNITY_KEY, JSON.stringify(onlyUser));
      return userPosts;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  const addCheckIn = useCallback(
    (mood: number, emoji: string, label: string, note?: string) => {
      const newCheckIn: MoodCheckIn = {
        id: Date.now().toString(),
        mood,
        emoji,
        label,
        note,
        date: new Date().toISOString(),
      };
      const updated = [newCheckIn, ...checkIns];
      setCheckIns(updated);
      persistCheckIns.mutate(updated);
      return newCheckIn;
    },
    [checkIns, persistCheckIns]
  );

  const addMilestone = useCallback(
    (milestone: Omit<Milestone, 'id' | 'createdAt'>) => {
      const newMilestone: Milestone = {
        ...milestone,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newMilestone, ...milestones];
      setMilestones(updated);
      persistMilestones.mutate(updated);
      return newMilestone;
    },
    [milestones, persistMilestones]
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      const updated = milestones.filter((m) => m.id !== id);
      setMilestones(updated);
      persistMilestones.mutate(updated);
    },
    [milestones, persistMilestones]
  );

  const addFavorite = useCallback(
    (fav: Omit<Favorite, 'id' | 'savedAt'>) => {
      const existing = favorites.find((f) => f.sourceId === fav.sourceId && f.type === fav.type);
      if (existing) return existing;
      const newFav: Favorite = {
        ...fav,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      persistFavorites.mutate(updated);
      return newFav;
    },
    [favorites, persistFavorites]
  );

  const removeFavorite = useCallback(
    (sourceId: string, type: Favorite['type']) => {
      const updated = favorites.filter((f) => !(f.sourceId === sourceId && f.type === type));
      setFavorites(updated);
      persistFavorites.mutate(updated);
    },
    [favorites, persistFavorites]
  );

  const isFavorite = useCallback(
    (sourceId: string, type: Favorite['type']) => {
      return favorites.some((f) => f.sourceId === sourceId && f.type === type);
    },
    [favorites]
  );

  const addCommunityPost = useCallback(
    (message: string, emoji: string) => {
      const newPost: CommunityPost = {
        id: `user-${Date.now()}`,
        message,
        emoji,
        createdAt: new Date().toISOString(),
        hearts: 0,
        isOwn: true,
      };
      const updated = [newPost, ...communityPosts];
      setCommunityPosts(updated);
      persistCommunity.mutate(updated);
      return newPost;
    },
    [communityPosts, persistCommunity]
  );

  const heartCommunityPost = useCallback(
    (postId: string) => {
      const updated = communityPosts.map((p) =>
        p.id === postId ? { ...p, hearts: p.hearts + 1 } : p
      );
      setCommunityPosts(updated);
      persistCommunity.mutate(updated);
    },
    [communityPosts, persistCommunity]
  );

  const todayCheckIn = useMemo(() => {
    const today = new Date().toDateString();
    return checkIns.find((c) => new Date(c.date).toDateString() === today);
  }, [checkIns]);

  const recentCheckIns = useMemo(
    () => checkIns.slice(0, 30),
    [checkIns]
  );

  const upcomingMilestones = useMemo(() => {
    const now = new Date();
    return milestones
      .map((m) => {
        const mDate = new Date(m.date);
        const thisYear = new Date(now.getFullYear(), mDate.getMonth(), mDate.getDate());
        if (thisYear < now) {
          thisYear.setFullYear(thisYear.getFullYear() + 1);
        }
        return { ...m, nextDate: thisYear };
      })
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  }, [milestones]);

  return {
    checkIns,
    recentCheckIns,
    todayCheckIn,
    addCheckIn,
    milestones,
    upcomingMilestones,
    addMilestone,
    deleteMilestone,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    communityPosts,
    addCommunityPost,
    heartCommunityPost,
    isLoading: checkInsQuery.isLoading || milestonesQuery.isLoading || favoritesQuery.isLoading,
  };
});
