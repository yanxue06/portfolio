// Spotify API utility functions - now using Vercel serverless functions

// Use relative API routes for Vercel deployment, but allow localhost override
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5173/api' 
  : '/api';

export const getNowPlaying = async () => {
  try {
    const response = await fetch(`${API_BASE}/spotify-now-playing`);
    
    if (!response.ok) {
      return { isPlaying: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching now playing:', error);
    return { isPlaying: false, error: true };
  }
};

export const getRecentlyPlayed = async () => {
  try {
    const response = await fetch(`${API_BASE}/spotify-recently-played`);
    
    if (!response.ok) {
      return { hasData: false };
    }

    const data = await response.json();
    
    if (data.hasData && data.playedAt) {
      data.playedAt = new Date(data.playedAt);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return { hasData: false, error: true };
  }
};
