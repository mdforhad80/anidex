// ============================================
// ROUTER - Simple Page Router
// ============================================

const Router = {
  init() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    switch(page) {
      case 'index.html':
      case '':
        document.addEventListener('DOMContentLoaded', () => App.init());
        break;
      case 'anime.html':
        document.addEventListener('DOMContentLoaded', () => AnimePage.init());
        break;
      case 'watch.html':
        document.addEventListener('DOMContentLoaded', () => Player.init());
        break;
      case 'search.html':
        document.addEventListener('DOMContentLoaded', () => SearchPage.init());
        break;
      case 'schedule.html':
        document.addEventListener('DOMContentLoaded', () => SchedulePage.init());
        break;
    }
  }
};

// Schedule page logic
const SchedulePage = {
  currentDay: '',
  scheduleData: {},

  async init() {
    UI.initLoadingScreen();
    UI.initHeaderScroll();
    UI.initSidebar();
    UI.initSearchOverlay();
    UI.initCursorGlow();
    UI.initParticles();

    await this.loadSchedule();
  },

  async loadSchedule() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    this.currentDay = today;

    // Load all days
    const promises = days.map(day => 
      API.getSchedule(day).catch(() => ({ data: [] }))
    );

    const results = await Promise.all(promises);

    days.forEach((day, i) => {
      this.scheduleData[day] = results[i].data || [];
    });

    this.renderTabs(days, today);
    this.renderDay(today);
  },

  renderTabs(days, activeDay) {
    const tabs = document.querySelector('.schedule-day-tabs');
    if (!tabs) return;

    const dayLabels = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
      thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };

    tabs.innerHTML = days.map(day => `
      <button class="day-tab ${day === activeDay ? 'active' : ''}" data-day="${day}">
        ${dayLabels[day]}
      </button>
    `).join('');

    tabs.querySelectorAll('.day-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderDay(tab.dataset.day);
      });
    });
  },

  renderDay(day) {
    const container = document.querySelector('.schedule-content');
    const anime = this.scheduleData[day] || [];

    if (anime.length === 0) {
      container.innerHTML = `
        <div class="schedule-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h3>No anime scheduled for ${day.charAt(0).toUpperCase() + day.slice(1)}</h3>
          <p>Check back later for updates</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="anime-grid">
        ${anime.map(a => UI.createAnimeCard(a)).join('')}
      </div>
    `;

    Utils.lazyLoadImages();
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Router, SchedulePage };
}
