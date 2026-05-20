// ============================================
// STORAGE - localStorage Management
// ============================================

const Storage = {
  KEYS: {
    WATCH_HISTORY: 'anime_watch_history',
    CONTINUE_WATCHING: 'anime_continue_watching',
    WATCHED_EPISODES: 'anime_watched_episodes',
    SETTINGS: 'anime_settings',
    LAST_VISIT: 'anime_last_visit'
  },

  // Generic get
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  // Generic set
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  // Watch History
  addToHistory(anime) {
    const history = this.getWatchHistory();
    const existing = history.findIndex(h => h.mal_id === anime.mal_id);

    if (existing > -1) {
      history.splice(existing, 1);
    }

    history.unshift({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url || anime.image,
      score: anime.score,
      type: anime.type,
      status: anime.status,
      timestamp: Date.now()
    });

    // Keep last 100
    if (history.length > 100) history.pop();

    this.set(this.KEYS.WATCH_HISTORY, history);
  },

  getWatchHistory() {
    return this.get(this.KEYS.WATCH_HISTORY, []);
  },

  clearHistory() {
    this.set(this.KEYS.WATCH_HISTORY, []);
  },

  // Continue Watching
  saveProgress(animeId, episode, progress = 0, total = 0, type = 'sub') {
    const watching = this.getContinueWatching();
    const existing = watching.findIndex(w => w.mal_id === animeId);

    const entry = {
      mal_id: animeId,
      episode: episode,
      progress: progress,
      total: total,
      type: type,
      timestamp: Date.now()
    };

    if (existing > -1) {
      watching[existing] = entry;
    } else {
      watching.unshift(entry);
    }

    // Keep last 50
    if (watching.length > 50) watching.pop();

    this.set(this.KEYS.CONTINUE_WATCHING, watching);
  },

  getContinueWatching() {
    return this.get(this.KEYS.CONTINUE_WATCHING, []);
  },

  removeFromContinueWatching(animeId) {
    const watching = this.getContinueWatching().filter(w => w.mal_id !== animeId);
    this.set(this.KEYS.CONTINUE_WATCHING, watching);
  },

  // Watched Episodes
  markEpisodeWatched(animeId, episode) {
    const key = `${this.KEYS.WATCHED_EPISODES}_${animeId}`;
    const watched = this.get(key, []);
    if (!watched.includes(episode)) {
      watched.push(episode);
      this.set(key, watched);
    }
  },

  isEpisodeWatched(animeId, episode) {
    const key = `${this.KEYS.WATCHED_EPISODES}_${animeId}`;
    const watched = this.get(key, []);
    return watched.includes(episode);
  },

  getWatchedEpisodes(animeId) {
    const key = `${this.KEYS.WATCHED_EPISODES}_${animeId}`;
    return this.get(key, []);
  },

  // Settings
  getSettings() {
    return this.get(this.KEYS.SETTINGS, {
      autoPlay: true,
      autoNext: true,
      defaultType: 'sub',
      skipIntro: false,
      theaterMode: false
    });
  },

  saveSettings(settings) {
    const current = this.getSettings();
    this.set(this.KEYS.SETTINGS, { ...current, ...settings });
  },

  // Clear all data
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // Clear watched episodes
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.KEYS.WATCHED_EPISODES)) {
        localStorage.removeItem(key);
      }
    }
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
