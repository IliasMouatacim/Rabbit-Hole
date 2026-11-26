import { dailySeed } from './expedition-engine';
import { questionById } from './questions';

const key = 'rh-descent-profile-v1';
export const descentWorlds = ['ocean', 'forest', 'dreams', 'football', 'music'];
export const fragmentQuestions: Record<string, string[]> = {
  ocean: ['ocean', 'energy', 'discovery'],
  forest: ['forest', 'signals', 'resilience'],
  dreams: ['dreams', 'memory', 'transfer'],
  football: ['football', 'football-tactics', 'football-possession'],
  music: ['music', 'music-rhythm', 'music-connection'],
};

export type Profile = { discoveries: string[]; worlds: string[]; bestDepth: number; dailyWins: string[]; skin?: string };
export function readProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return {
      discoveries: Array.isArray(value.discoveries) ? value.discoveries.filter((id: string) => questionById.has(id)) : [],
      worlds: Array.isArray(value.worlds) ? value.worlds.filter((id: string) => descentWorlds.includes(id)) : [],
      bestDepth: Number.isInteger(value.bestDepth) ? value.bestDepth : 0,
      dailyWins: Array.isArray(value.dailyWins) ? value.dailyWins.filter((code: unknown) => typeof code === 'string') : [],
      skin: value.skin === 'starlight' ? value.skin : undefined,
    };
  } catch {
    return { discoveries: [], worlds: [], bestDepth: 0, dailyWins: [] };
  }
}

export function writeProfile(profile: Profile) {
  try { localStorage.setItem(key, JSON.stringify(profile)); } catch { /* Play continues in memory. */ }
  return profile;
}

export function dailyStreak(profile: Profile, date = new Date()) {
  let day = dailySeed(date);
  const cursor = new Date(day.slice(6) + 'T12:00:00Z');
  if (!profile.dailyWins.includes(day)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let count = 0;
  while (profile.dailyWins.includes(day = dailySeed(cursor))) {
    count++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
