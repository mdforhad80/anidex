// ============================================
// UI - UI Helper Functions
// ============================================

const UI = {
  // Initialize loading screen
  initLoadingScreen() {
    const loader = document.querySelector('.loading-screen');
    if (loader) {
      window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 500);
      });
      // Fallback
      setTimeout(() => loader.classList.add('hidden'), 3000);
    }
  },

  // Initialize header scroll effect
  initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100));
  },

  // Initialize sidebar
  initSidebar() {
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const closeBtn = document.querySelector('.sidebar-close');

    if (!menuBtn || !sidebar) return;

    const open = () => {
      sidebar.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      sidebar.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    };

    menuBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    sidebar.querySelectorAll('a').forEach(link => {
      if (link.getAttribute('href')?.includes(currentPage)) {
        link.classList.add('active');
      }
    });
  },

  // Initialize search overlay
  initSearchOverlay() {
    const searchBtn = document.querySelector('.search-btn');
    const overlay = document.querySelector('.search-overlay');
    const closeBtn = document.querySelector('.search-close-btn');
    const input = document.querySelector('.search-input');

    if (!searchBtn || !overlay) return;

    const open = () => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input?.focus(), 100);
    };

    const close = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (input) input.value = '';
    };

    searchBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    });

    // Search input handler
    if (input) {
      input.addEventListener('input', Utils.debounce(() => {
        const query = input.value.trim();
        if (query.length >= 2) {
          this.performLiveSearch(query);
        }
      }, 400));

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = input.value.trim();
          if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  },

  // Live search in overlay
  async performLiveSearch(query) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '<div class="text-center mt-3"><div class="spinner"></div></div>';

    try {
      const data = await API.searchAnime(query, 1, { limit: 8 });
      const anime = data.data || [];

      if (anime.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center text-muted mt-3">No results found</p>';
        return;
      }

      resultsContainer.innerHTML = `
        <div class="section-header">
          <span class="section-title">Results for "${Utils.escapeHtml(query)}"</span>
          <a href="search.html?q=${encodeURIComponent(query)}" class="section-link">View all →</a>
        </div>
        <div class="carousel" style="flex-wrap: wrap;">
          ${anime.map(a => this.createAnimeCard(a)).join('')}
        </div>
      `;

      Utils.lazyLoadImages();
    } catch (error) {
      resultsContainer.innerHTML = '<p class="text-center text-muted mt-3">Search failed. Please try again.</p>';
    }
  },

  // Create anime card HTML
  createAnimeCard(anime, wide = false) {
    const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '/assets/images/placeholder.jpg';
    const title = anime.title_english || anime.title || 'Unknown';
    const score = anime.score ? anime.score.toFixed(1) : 'N/A';
    const episodes = anime.episodes || '?';
    const type = anime.type || 'TV';
    const status = anime.status || '';

    let badge = '';
    if (status === 'Currently Airing') badge = '<span class="card-badge airing">Airing</span>';
    else if (type === 'Movie') badge = '<span class="card-badge movie">Movie</span>';

    const cardClass = wide ? 'anime-card-wide' : 'anime-card';

    return `
      <a href="anime.html?id=${anime.mal_id}" class="${cardClass} fade-in">
        <div class="card-img-wrapper">
          <img class="card-img" data-src="${image}" alt="${Utils.escapeHtml(title)}" loading="lazy">
          ${badge}
          <span class="card-episodes">${episodes} EP</span>
          <div class="card-play">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="card-title">${Utils.escapeHtml(title)}</div>
        <div class="card-meta">
          <span class="rating">★ ${score}</span>
          <span>•</span>
          <span>${type}</span>
        </div>
      </a>
    `;
  },

  // Create wide card for continue watching
  createContinueCard(anime, progress) {
    const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '/assets/images/placeholder.jpg';
    const title = anime.title_english || anime.title || 'Unknown';
    const percent = progress.total > 0 ? (progress.progress / progress.total) * 100 : 0;

    return `
      <a href="watch.html?id=${anime.mal_id}&ep=${progress.episode}&type=${progress.type}" class="anime-card-wide fade-in">
        <div class="card-img-wrapper">
          <img class="card-img" data-src="${image}" alt="${Utils.escapeHtml(title)}" loading="lazy">
          <div class="card-play">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${percent}%"></div>
          </div>
        </div>
        <div class="card-title">${Utils.escapeHtml(title)}</div>
        <div class="card-meta">Episode ${progress.episode} • ${progress.type.toUpperCase()}</div>
      </a>
    `;
  },

  // Initialize carousel buttons
  initCarousels() {
    document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
      const carousel = wrapper.querySelector('.carousel');
      const prevBtn = wrapper.querySelector('.carousel-btn.prev');
      const nextBtn = wrapper.querySelector('.carousel-btn.next');

      if (!carousel) return;

      const scrollAmount = 220;

      prevBtn?.addEventListener('click', () => {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn?.addEventListener('click', () => {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    });
  },

  // Initialize cursor glow
  initCursorGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const glow = document.querySelector('.cursor-glow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;
      glow.style.left = currentX + 'px';
      glow.style.top = currentY + 'px';
      requestAnimationFrame(animate);
    }
    animate();
  },

  // Initialize particles
  initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 30;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  },

  // Initialize hero slider
  initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.hero-dot');
    if (slides.length === 0) return;

    let current = 0;
    let interval;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      current = index;
    }

    function nextSlide() {
      showSlide((current + 1) % slides.length);
    }

    // Auto slide
    interval = setInterval(nextSlide, 6000);

    // Dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        showSlide(i);
        interval = setInterval(nextSlide, 6000);
      });
    });
  },

  // Initialize random button
  initRandomButton() {
    const btn = document.querySelector('.random-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => btn.style.transform = '', 150);

      try {
        const data = await API.getRandomAnime();
        if (data.data) {
          window.location.href = `anime.html?id=${data.data.mal_id}`;
        }
      } catch (e) {
        Utils.showToast('Failed to get random anime', 'error');
      }
    });
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}
