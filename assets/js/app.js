// ============================================
// APP - Main Application Logic
// ============================================

const App = {
  heroAnime: [],

  async init() {
    UI.initLoadingScreen();
    UI.initHeaderScroll();
    UI.initSidebar();
    UI.initSearchOverlay();
    UI.initCarousels();
    UI.initCursorGlow();
    UI.initParticles();
    UI.initHeroSlider();
    UI.initRandomButton();

    await this.loadHomePage();
  },

  async loadHomePage() {
    try {
      // Load data in parallel
      const [
        currentSeason,
        topAiring,
        topAnime,
        upcoming,
        schedule
      ] = await Promise.all([
        API.getCurrentSeason(1).catch(() => ({ data: [] })),
        API.getTopAnime(1, 10, 'airing').catch(() => ({ data: [] })),
        API.getTopAnime(1, 12).catch(() => ({ data: [] })),
        API.getUpcoming(1).catch(() => ({ data: [] })),
        API.getSchedule().catch(() => ({ data: [] }))
      ]);

      this.renderHero(topAiring.data?.slice(0, 5) || []);
      this.renderSection('latest-section', currentSeason.data || [], 'Latest Updates');
      this.renderSection('trending-section', topAiring.data || [], 'Trending Now');
      this.renderSection('popular-section', topAnime.data || [], 'Popular Anime');
      this.renderSection('upcoming-section', upcoming.data || [], 'Upcoming Anime');
      this.renderSchedule(schedule.data || []);
      this.renderContinueWatching();
      this.renderHistory();

      Utils.lazyLoadImages();

    } catch (error) {
      console.error('Error loading homepage:', error);
    }
  },

  renderHero(animeList) {
    const slider = document.querySelector('.hero-slider');
    const dots = document.querySelector('.hero-dots');
    if (!slider || animeList.length === 0) return;

    this.heroAnime = animeList;

    slider.innerHTML = animeList.map((anime, i) => {
      const image = anime.images?.jpg?.large_image_url || 
                   anime.images?.jpg?.image_url || '';
      const title = anime.title_english || anime.title;
      const score = anime.score ? anime.score.toFixed(1) : 'N/A';
      const type = anime.type || 'TV';
      const episodes = anime.episodes || '?';
      const desc = Utils.truncate(anime.synopsis, 200);

      return `
        <div class="hero-slide ${i === 0 ? 'active' : ''}">
          <div class="hero-bg" style="background-image: url('${image}')"></div>
          <div class="hero-content">
            <div class="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Top Airing
            </div>
            <h1 class="hero-title">${Utils.escapeHtml(title)}</h1>
            <div class="hero-meta">
              <span class="rating">★ ${score}</span>
              <span class="dot"></span>
              <span>${type}</span>
              <span class="dot"></span>
              <span>${episodes} Episodes</span>
            </div>
            <p class="hero-desc">${Utils.escapeHtml(desc)}</p>
            <div class="hero-buttons">
              <a href="watch.html?id=${anime.mal_id}&ep=1&type=sub" class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch Now
              </a>
              <a href="anime.html?id=${anime.mal_id}" class="btn btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                More Info
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (dots) {
      dots.innerHTML = animeList.map((_, i) => 
        `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
      ).join('');
    }

    // Re-init slider after rendering
    UI.initHeroSlider();
  },

  renderSection(sectionId, animeList, title) {
    const section = document.getElementById(sectionId);
    if (!section || animeList.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    const carousel = section.querySelector('.carousel');
    if (carousel) {
      carousel.innerHTML = animeList.map(a => UI.createAnimeCard(a)).join('');
    }
  },

  renderSchedule(scheduleData) {
    const section = document.getElementById('schedule-section');
    if (!section || scheduleData.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    const today = new Date().getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today];

    const todayAnime = scheduleData.filter(a => 
      a.broadcast?.day?.toLowerCase() === todayName
    ).slice(0, 8);

    if (todayAnime.length === 0) {
      section.style.display = 'none';
      return;
    }

    const carousel = section.querySelector('.carousel');
    if (carousel) {
      carousel.innerHTML = todayAnime.map(a => UI.createAnimeCard(a)).join('');
    }
  },

  async renderContinueWatching() {
    const section = document.getElementById('continue-section');
    if (!section) return;

    const watching = Storage.getContinueWatching().slice(0, 10);
    if (watching.length === 0) {
      section.style.display = 'none';
      return;
    }

    const carousel = section.querySelector('.carousel');
    if (!carousel) return;

    // Fetch anime details for each
    const promises = watching.map(async (w) => {
      try {
        const data = await API.getAnime(w.mal_id);
        return { anime: data.data, progress: w };
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(promises)).filter(Boolean);

    if (results.length === 0) {
      section.style.display = 'none';
      return;
    }

    carousel.innerHTML = results.map(r => 
      UI.createContinueCard(r.anime, r.progress)
    ).join('');

    Utils.lazyLoadImages();
  },

  async renderHistory() {
    const section = document.getElementById('history-section');
    if (!section) return;

    const history = Storage.getWatchHistory().slice(0, 12);
    if (history.length === 0) {
      section.style.display = 'none';
      return;
    }

    const carousel = section.querySelector('.carousel');
    if (!carousel) return;

    carousel.innerHTML = history.map(h => `
      <a href="anime.html?id=${h.mal_id}" class="anime-card fade-in">
        <div class="card-img-wrapper">
          <img class="card-img" data-src="${h.image}" alt="${Utils.escapeHtml(h.title)}" loading="lazy">
          <div class="card-play">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="card-title">${Utils.escapeHtml(h.title)}</div>
        <div class="card-meta">
          <span class="rating">★ ${h.score || 'N/A'}</span>
          <span>•</span>
          <span>${h.type || 'TV'}</span>
        </div>
      </a>
    `).join('');

    Utils.lazyLoadImages();
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
