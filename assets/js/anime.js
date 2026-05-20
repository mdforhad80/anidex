// ============================================
// ANIME - Anime Details Page Logic
// ============================================

const AnimePage = {
  currentAnime: null,
  currentType: 'sub',

  async init() {
    const id = Utils.getParam('id');
    if (!id) {
      window.location.href = 'index.html';
      return;
    }

    await this.loadAnime(id);
  },

  async loadAnime(id) {
    try {
      const [animeData, charactersData, recommendationsData] = await Promise.all([
        API.getAnime(id),
        API.getCharacters(id).catch(() => ({ data: [] })),
        API.getRecommendations(id).catch(() => ({ data: [] }))
      ]);

      this.currentAnime = animeData.data;

      // Save to history
      Storage.addToHistory(this.currentAnime);

      this.renderBanner();
      this.renderInfo();
      this.renderEpisodes();
      this.renderCharacters(charactersData.data || []);
      this.renderRecommendations(recommendationsData.data || []);

      // Update page title
      document.title = `${this.currentAnime.title_english || this.currentAnime.title} - Anime Stream`;

      // Update meta tags
      this.updateMetaTags();

    } catch (error) {
      console.error('Error loading anime:', error);
      document.querySelector('.anime-details-page').innerHTML = `
        <div class="container text-center mt-4">
          <h2>Failed to load anime</h2>
          <p class="text-muted">The anime may not exist or the API is unavailable.</p>
          <a href="index.html" class="btn btn-primary mt-2">Go Home</a>
        </div>
      `;
    }
  },

  renderBanner() {
    const anime = this.currentAnime;
    const banner = document.querySelector('.anime-banner-img');
    if (banner && anime.trailer?.images?.maximum_image_url) {
      banner.src = anime.trailer.images.maximum_image_url;
    } else if (banner && anime.images?.jpg?.large_image_url) {
      banner.src = anime.images.jpg.large_image_url;
    }
  },

  renderInfo() {
    const anime = this.currentAnime;
    const poster = document.querySelector('.anime-poster');
    if (poster) {
      poster.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
      poster.alt = anime.title;
    }

    const title = document.querySelector('.anime-title');
    if (title) title.textContent = anime.title_english || anime.title;

    const altTitle = document.querySelector('.anime-alt-title');
    if (altTitle) {
      const alts = [];
      if (anime.title_japanese) alts.push(anime.title_japanese);
      if (anime.title_synonyms?.length) alts.push(...anime.title_synonyms);
      altTitle.textContent = alts.join(' • ');
    }

    const metaRow = document.querySelector('.anime-meta-row');
    if (metaRow) {
      const score = anime.score ? anime.score.toFixed(2) : 'N/A';
      const episodes = anime.episodes || '?';
      const type = anime.type || 'TV';
      const rating = anime.rating || 'PG-13';

      metaRow.innerHTML = `
        <span class="badge badge-rating">${rating}</span>
        <span class="badge badge-type">${type}</span>
        <span class="anime-score">★ ${score}</span>
        <span>${episodes} Episodes</span>
      `;
    }

    const desc = document.querySelector('.anime-desc');
    if (desc) desc.textContent = anime.synopsis || 'No synopsis available.';

    const infoList = document.querySelector('.anime-info-list');
    if (infoList) {
      const genres = anime.genres?.map(g => g.name).join(', ') || 'N/A';
      const studios = anime.studios?.map(s => s.name).join(', ') || 'N/A';
      const producers = anime.producers?.map(p => p.name).join(', ') || 'N/A';
      const premiered = anime.season && anime.year ? `${anime.season} ${anime.year}` : 'N/A';
      const broadcast = anime.broadcast?.string || 'N/A';
      const duration = anime.duration || 'N/A';
      const status = anime.status || 'N/A';
      const aired = anime.aired?.string || 'N/A';
      const source = anime.source || 'N/A';

      infoList.innerHTML = `
        <p><strong>Status:</strong> <span class="status-${status.toLowerCase().replace(/\s+/g, '-')}">${status}</span></p>
        <p><strong>Episodes:</strong> ${anime.episodes || 'N/A'}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Score:</strong> ${anime.score || 'N/A'} (${anime.scored_by ? Utils.formatNumber(anime.scored_by) + ' users' : 'N/A'})</p>
        <p><strong>Ranked:</strong> #${anime.rank || 'N/A'}</p>
        <p><strong>Popularity:</strong> #${anime.popularity || 'N/A'}</p>
        <p><strong>Members:</strong> ${anime.members ? Utils.formatNumber(anime.members) : 'N/A'}</p>
        <p><strong>Favorites:</strong> ${anime.favorites ? Utils.formatNumber(anime.favorites) : 'N/A'}</p>
        <p><strong>Genres:</strong> ${genres}</p>
        <p><strong>Premiered:</strong> ${premiered}</p>
        <p><strong>Aired:</strong> ${aired}</p>
        <p><strong>Broadcast:</strong> ${broadcast}</p>
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>Studios:</strong> ${studios}</p>
        <p><strong>Producers:</strong> ${producers}</p>
        <p><strong>Links:</strong> <a href="https://myanimelist.net/anime/${anime.mal_id}" target="_blank">MyAnimeList</a></p>
      `;
    }

    // Genre tags
    const genreContainer = document.querySelector('.genre-tags');
    if (genreContainer && anime.genres) {
      genreContainer.innerHTML = anime.genres.map(g => 
        `<a href="search.html?genre=${g.mal_id}" class="genre-tag">${g.name}</a>`
      ).join('');
    }

    // Watch button
    const watchBtn = document.querySelector('.watch-btn');
    if (watchBtn) {
      watchBtn.href = `watch.html?id=${anime.mal_id}&ep=1&type=sub`;
    }
  },

  renderEpisodes() {
    const anime = this.currentAnime;
    const episodesCount = anime.episodes || 24;
    const container = document.querySelector('.episodes-grid');
    if (!container) return;

    const watched = Storage.getWatchedEpisodes(anime.mal_id);

    let html = '';
    for (let i = 1; i <= episodesCount; i++) {
      const isWatched = watched.includes(i);
      html += `
        <a href="watch.html?id=${anime.mal_id}&ep=${i}&type=${this.currentType}" 
           class="episode-card ${isWatched ? 'watched' : ''}">
          <div class="episode-number">EP ${i}</div>
          <div class="episode-title">Episode ${i}</div>
          <div class="episode-servers">
            <span class="server-tag sub">SUB</span>
            <span class="server-tag dub">DUB</span>
          </div>
        </a>
      `;
    }
    container.innerHTML = html;

    // Sub/Dub toggle
    const toggle = document.querySelector('.sub-dub-toggle');
    if (toggle) {
      toggle.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentType = btn.dataset.type;
          // Update episode links
          container.querySelectorAll('.episode-card').forEach((card, i) => {
            card.href = `watch.html?id=${anime.mal_id}&ep=${i + 1}&type=${this.currentType}`;
          });
        });
      });
    }
  },

  renderCharacters(characters) {
    const container = document.querySelector('.characters-grid');
    if (!container || !characters.length) return;

    const mainChars = characters.slice(0, 12);
    container.innerHTML = mainChars.map(c => `
      <div class="character-card fade-in">
        <img data-src="${c.character?.images?.jpg?.image_url || ''}" alt="${c.character?.name || ''}" loading="lazy">
        <p>${Utils.escapeHtml(c.character?.name || 'Unknown')}</p>
        <span>${c.role || ''}</span>
      </div>
    `).join('');

    Utils.lazyLoadImages();
  },

  renderRecommendations(recommendations) {
    const container = document.querySelector('.related-grid');
    if (!container || !recommendations.length) {
      const section = document.querySelector('.related-section');
      if (section) section.style.display = 'none';
      return;
    }

    const recs = recommendations.slice(0, 6);
    container.innerHTML = recs.map(r => `
      <a href="anime.html?id=${r.entry?.mal_id}" class="anime-card fade-in">
        <div class="card-img-wrapper">
          <img class="card-img" data-src="${r.entry?.images?.jpg?.image_url || ''}" alt="${r.entry?.title || ''}" loading="lazy">
          <div class="card-play">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="card-title">${Utils.escapeHtml(r.entry?.title || 'Unknown')}</div>
      </a>
    `).join('');

    Utils.lazyLoadImages();
  },

  updateMetaTags() {
    const anime = this.currentAnime;
    const title = anime.title_english || anime.title;
    const desc = Utils.truncate(anime.synopsis, 200);
    const image = anime.images?.jpg?.large_image_url || '';

    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimePage;
}
