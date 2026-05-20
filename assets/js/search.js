// ============================================
// SEARCH - Search Page Logic
// ============================================

const SearchPage = {
  currentPage: 1,
  currentQuery: '',
  currentFilters: {},
  isLoading: false,
  hasMore: true,

  async init() {
    const query = Utils.getParam('q') || '';
    const genre = Utils.getParam('genre') || '';
    const type = Utils.getParam('type') || '';
    const status = Utils.getParam('status') || '';
    const season = Utils.getParam('season') || '';
    const year = Utils.getParam('year') || '';

    // Set filter values
    if (type) document.querySelector('#filter-type')?.value = type;
    if (status) document.querySelector('#filter-status')?.value = status;
    if (season) document.querySelector('#filter-season')?.value = season;
    if (year) document.querySelector('#filter-year')?.value = year;

    this.currentQuery = query;
    this.currentFilters = { type, status, season, year };
    if (genre) this.currentFilters.genres = genre;

    // Set search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput && query) searchInput.value = query;

    if (query || genre) {
      await this.loadResults();
    } else {
      this.loadPopular();
    }

    this.setupInfiniteScroll();
    this.setupFilters();
  },

  async loadResults() {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;

    const container = document.querySelector('.search-results-grid');
    const stats = document.querySelector('.search-stats');

    if (this.currentPage === 1) {
      container.innerHTML = '<div class="anime-grid">' + Utils.createSkeletonCards(12) + '</div>';
    }

    try {
      const data = await API.searchAnime(
        this.currentQuery,
        this.currentPage,
        this.currentFilters
      );

      const anime = data.data || [];
      const pagination = data.pagination || {};

      this.hasMore = pagination.has_next_page || false;

      if (this.currentPage === 1) {
        if (anime.length === 0) {
          container.innerHTML = `
            <div class="text-center mt-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin-bottom: 1rem;">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <h3>No results found</h3>
              <p class="text-muted">Try different keywords or filters</p>
            </div>
          `;
          if (stats) stats.style.display = 'none';
        } else {
          if (stats) {
            stats.textContent = `Found ${pagination.items?.total || anime.length} results`;
            stats.style.display = 'block';
          }
          container.innerHTML = '<div class="anime-grid">' + 
            anime.map(a => UI.createAnimeCard(a)).join('') + 
            '</div>';
        }
      } else {
        const grid = container.querySelector('.anime-grid');
        if (grid) {
          grid.innerHTML += anime.map(a => UI.createAnimeCard(a)).join('');
        }
      }

      Utils.lazyLoadImages();
      this.currentPage++;

    } catch (error) {
      console.error('Search error:', error);
      if (this.currentPage === 1) {
        container.innerHTML = '<p class="text-center text-muted">Search failed. Please try again.</p>';
      }
    } finally {
      this.isLoading = false;
    }
  },

  async loadPopular() {
    const container = document.querySelector('.search-results-grid');
    const stats = document.querySelector('.search-stats');

    if (stats) stats.textContent = 'Popular Anime';
    container.innerHTML = '<div class="anime-grid">' + Utils.createSkeletonCards(12) + '</div>';

    try {
      const data = await API.getTopAnime(1, 24);
      const anime = data.data || [];

      container.innerHTML = '<div class="anime-grid">' + 
        anime.map(a => UI.createAnimeCard(a)).join('') + 
        '</div>';

      Utils.lazyLoadImages();
    } catch (error) {
      container.innerHTML = '<p class="text-center text-muted">Failed to load anime.</p>';
    }
  },

  setupInfiniteScroll() {
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        if (this.currentQuery || Object.keys(this.currentFilters).some(k => this.currentFilters[k])) {
          this.loadResults();
        }
      }
    }, 500));
  },

  setupFilters() {
    const selects = document.querySelectorAll('.filter-select');
    selects.forEach(select => {
      select.addEventListener('change', () => {
        this.currentPage = 1;
        this.hasMore = true;

        this.currentFilters = {
          type: document.querySelector('#filter-type')?.value || '',
          status: document.querySelector('#filter-status')?.value || '',
          season: document.querySelector('#filter-season')?.value || '',
          year: document.querySelector('#filter-year')?.value || ''
        };

        this.loadResults();
      });
    });
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchPage;
}
