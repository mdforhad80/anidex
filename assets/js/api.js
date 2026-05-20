// ============================================
// API - Jikan API Wrapper
// ============================================

const API = {
  BASE_URL: 'https://api.jikan.moe/v4',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // Simple in-memory cache
  cache: new Map(),

  async fetch(endpoint, options = {}) {
    const cacheKey = endpoint + JSON.stringify(options);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.time < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(r => setTimeout(r, 1000));
          return this.fetch(endpoint, options);
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, { data, time: Date.now() });
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get anime by ID
  async getAnime(id) {
    return this.fetch(`/anime/${id}/full`);
  },

  // Get anime episodes
  async getEpisodes(id, page = 1) {
    return this.fetch(`/anime/${id}/episodes?page=${page}`);
  },

  // Search anime
  async searchAnime(query, page = 1, filters = {}) {
    const params = new URLSearchParams({ q: query, page, limit: 24 });

    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.genres) params.append('genres', filters.genres);
    if (filters.season) params.append('season', filters.season);
    if (filters.year) params.append('year', filters.year);
    if (filters.order_by) params.append('order_by', filters.order_by);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.score) params.append('min_score', filters.score);

    return this.fetch(`/anime?${params.toString()}`);
  },

  // Get top anime
  async getTopAnime(page = 1, limit = 24, filter = '') {
    const params = new URLSearchParams({ page, limit });
    if (filter) params.append('filter', filter);
    return this.fetch(`/top/anime?${params.toString()}`);
  },

  // Get seasonal anime
  async getSeasonalAnime(year, season, page = 1) {
    return this.fetch(`/seasons/${year}/${season}?page=${page}&limit=24`);
  },

  // Get current season
  async getCurrentSeason(page = 1) {
    return this.fetch(`/seasons/now?page=${page}&limit=24`);
  },

  // Get upcoming anime
  async getUpcoming(page = 1) {
    return this.fetch(`/seasons/upcoming?page=${page}&limit=24`);
  },

  // Get anime schedule
  async getSchedule(day = '') {
    const endpoint = day ? `/schedules?filter=${day}&limit=24` : '/schedules?limit=24';
    return this.fetch(endpoint);
  },

  // Get anime characters
  async getCharacters(id) {
    return this.fetch(`/anime/${id}/characters`);
  },

  // Get recommendations
  async getRecommendations(id) {
    return this.fetch(`/anime/${id}/recommendations`);
  },

  // Get anime by genre
  async getByGenre(genreId, page = 1) {
    return this.fetch(`/anime?genres=${genreId}&page=${page}&limit=24`);
  },

  // Get genres list
  async getGenres() {
    return this.fetch('/genres/anime');
  },

  // Get random anime
  async getRandomAnime() {
    return this.fetch('/random/anime');
  },

  // Get anime videos (trailers)
  async getVideos(id) {
    return this.fetch(`/anime/${id}/videos`);
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
