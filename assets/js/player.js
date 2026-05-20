// ============================================
// PLAYER - Watch Page Logic
// ============================================

const Player = {
  currentAnime: null,
  currentEpisode: 1,
  currentType: 'sub',
  totalEpisodes: 0,
  settings: {},

  async init() {
    const id = Utils.getParam('id');
    const ep = parseInt(Utils.getParam('ep')) || 1;
    const type = Utils.getParam('type') || 'sub';

    if (!id) {
      window.location.href = 'index.html';
      return;
    }

    this.currentEpisode = ep;
    this.currentType = type;
    this.settings = Storage.getSettings();

    await this.loadAnime(id);
  },

  async loadAnime(id) {
    try {
      const data = await API.getAnime(id);
      this.currentAnime = data.data;
      this.totalEpisodes = this.currentAnime.episodes || 24;

      // Add to history
      Storage.addToHistory(this.currentAnime);

      this.renderPlayer();
      this.renderEpisodeInfo();
      this.renderEpisodeList();
      this.renderRelated();
      this.setupKeyboardShortcuts();

      // Update title
      const title = this.currentAnime.title_english || this.currentAnime.title;
      document.title = `EP ${this.currentEpisode} - ${title} - Anime Stream`;

      // Mark as watched after 30 seconds
      setTimeout(() => {
        Storage.markEpisodeWatched(id, this.currentEpisode);
      }, 30000);

    } catch (error) {
      console.error('Error loading watch page:', error);
      document.querySelector('.watch-page').innerHTML = `
        <div class="container text-center mt-4">
          <h2>Failed to load episode</h2>
          <p class="text-muted">The anime or episode may not be available.</p>
          <a href="index.html" class="btn btn-primary mt-2">Go Home</a>
        </div>
      `;
    }
  },

  renderPlayer() {
    const iframe = document.querySelector('.player-iframe');
    const loading = document.querySelector('.player-loading');

    if (!iframe) return;

    const streamUrl = Utils.getStreamUrl(
      this.currentAnime.mal_id,
      this.currentEpisode,
      this.currentType
    );

    iframe.src = streamUrl;

    // Hide loading after iframe loads
    iframe.onload = () => {
      loading?.classList.add('hidden');
    };

    // Fallback hide loading
    setTimeout(() => {
      loading?.classList.add('hidden');
    }, 5000);
  },

  renderEpisodeInfo() {
    const title = this.currentAnime.title_english || this.currentAnime.title;
    const infoBar = document.querySelector('.episode-info-bar');

    if (infoBar) {
      infoBar.innerHTML = `
        <h1>${Utils.escapeHtml(title)} - Episode ${this.currentEpisode}</h1>
        <p>${this.currentType.toUpperCase()} • ${this.currentAnime.type || 'TV'} • Episode ${this.currentEpisode} of ${this.totalEpisodes}</p>
      `;
    }

    // Server selector
    const serverBtns = document.querySelectorAll('.server-btn');
    serverBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === this.currentType);
      btn.addEventListener('click', () => {
        this.currentType = btn.dataset.type;
        serverBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderPlayer();
        this.updateUrl();
      });
    });

    // Navigation buttons
    const prevBtn = document.querySelector('.prev-ep-btn');
    const nextBtn = document.querySelector('.next-ep-btn');

    if (prevBtn) {
      if (this.currentEpisode > 1) {
        prevBtn.href = `watch.html?id=${this.currentAnime.mal_id}&ep=${this.currentEpisode - 1}&type=${this.currentType}`;
        prevBtn.classList.remove('hidden');
      } else {
        prevBtn.classList.add('hidden');
      }
    }

    if (nextBtn) {
      if (this.currentEpisode < this.totalEpisodes) {
        nextBtn.href = `watch.html?id=${this.currentAnime.mal_id}&ep=${this.currentEpisode + 1}&type=${this.currentType}`;
        nextBtn.classList.remove('hidden');
      } else {
        nextBtn.classList.add('hidden');
      }
    }
  },

  renderEpisodeList() {
    const list = document.querySelector('.episode-list');
    if (!list) return;

    const watched = Storage.getWatchedEpisodes(this.currentAnime.mal_id);

    let html = '';
    for (let i = 1; i <= this.totalEpisodes; i++) {
      const isActive = i === this.currentEpisode;
      const isWatched = watched.includes(i);

      html += `
        <a href="watch.html?id=${this.currentAnime.mal_id}&ep=${i}&type=${this.currentType}" 
           class="episode-list-item ${isActive ? 'active' : ''} ${isWatched ? 'watched' : ''}">
          <div class="ep-list-num">${i}</div>
          <div class="ep-list-info">
            <div class="ep-list-title">Episode ${i}</div>
            <div class="ep-list-meta">${isWatched ? '✓ Watched' : ''}</div>
          </div>
        </a>
      `;
    }
    list.innerHTML = html;

    // Scroll to active episode
    const activeItem = list.querySelector('.active');
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  renderRelated() {
    const container = document.querySelector('.watch-related');
    if (!container) return;

    // Try to load recommendations
    API.getRecommendations(this.currentAnime.mal_id)
      .then(data => {
        const recs = (data.data || []).slice(0, 4);
        if (recs.length === 0) {
          container.style.display = 'none';
          return;
        }

        container.innerHTML = `
          <div class="section-header">
            <span class="section-title">You May Also Like</span>
          </div>
          <div class="anime-grid" style="grid-template-columns: repeat(2, 1fr);">
            ${recs.map(r => UI.createAnimeCard(r.entry)).join('')}
          </div>
        `;
        Utils.lazyLoadImages();
      })
      .catch(() => {
        container.style.display = 'none';
      });
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowRight':
        case 'n':
          if (this.currentEpisode < this.totalEpisodes) {
            window.location.href = `watch.html?id=${this.currentAnime.mal_id}&ep=${this.currentEpisode + 1}&type=${this.currentType}`;
          }
          break;
        case 'ArrowLeft':
        case 'p':
          if (this.currentEpisode > 1) {
            window.location.href = `watch.html?id=${this.currentAnime.mal_id}&ep=${this.currentEpisode - 1}&type=${this.currentType}`;
          }
          break;
        case 'f':
          this.toggleFullscreen();
          break;
        case 't':
          this.toggleTheaterMode();
          break;
      }
    });

    // Show keyboard hint
    const hint = document.querySelector('.keyboard-hint');
    if (hint) {
      setTimeout(() => hint.classList.add('visible'), 1000);
      setTimeout(() => hint.classList.remove('visible'), 6000);
    }
  },

  toggleFullscreen() {
    const player = document.querySelector('.player-wrapper');
    if (!player) return;

    if (!document.fullscreenElement) {
      player.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  },

  toggleTheaterMode() {
    const section = document.querySelector('.player-section');
    section?.classList.toggle('theater-mode');
  },

  updateUrl() {
    const url = new URL(window.location);
    url.searchParams.set('type', this.currentType);
    window.history.replaceState({}, '', url);
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}
