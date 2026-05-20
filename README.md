# AnimeStream

A modern, premium anime streaming website built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. Deployable on GitHub Pages and Cloudflare Pages.

## Features

- **Dynamic Anime Generation** - Automatically fetches anime metadata from Jikan API using MyAnimeList IDs
- **Auto-Generated Episodes** - Episode lists and streaming URLs generated dynamically
- **HD Streaming** - Embedded player with megaplay.buzz streaming URLs
- **Netflix-Quality UI** - Glassmorphism cards, neon glow effects, particle backgrounds
- **Responsive Design** - Mobile-first with bottom navigation on phones
- **PWA Support** - Service worker, offline caching, manifest.json
- **Watch History** - Tracks viewed anime using localStorage
- **Continue Watching** - Resume episodes where you left off
- **Search & Filters** - Live search with genre, type, status, season, and year filters
- **Keyboard Shortcuts** - Navigate episodes with arrow keys, fullscreen with F
- **Weekly Schedule** - View airing anime by day
- **No Authentication** - Completely anonymous, no login required

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home with hero slider, trending, popular, upcoming, schedule |
| `anime.html?id=XXX` | Anime details with episodes, characters, recommendations |
| `watch.html?id=XXX&ep=1&type=sub` | Video player with episode list sidebar |
| `search.html?q=XXX` | Search with filters and infinite scroll |
| `schedule.html` | Weekly airing schedule |
| `creator.html` | Project credits and links |

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: [Jikan API](https://jikan.moe) (MyAnimeList unofficial API)
- **Streaming**: megaplay.buzz
- **Hosting**: GitHub Pages / Cloudflare Pages
- **PWA**: Service Worker, Web App Manifest

## Deployment

### GitHub Pages

1. Fork or clone this repository
2. Go to **Settings > Pages**
3. Select source: **Deploy from a branch**
4. Choose branch: `main` / `master`
5. Your site will be live at `https://yourusername.github.io/animestream`

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: *(leave empty for static site)*
3. Set build output directory: `/`
4. Deploy!

### Cloudflare Workers (Optional API Proxy)

```bash
cd cloudflare
wrangler deploy
```

## Folder Structure

```
/
├── index.html          # Home page
├── anime.html          # Anime details
├── watch.html          # Video player
├── search.html         # Search & filters
├── schedule.html       # Weekly schedule
├── creator.html        # Creator profile
├── assets/
│   ├── css/
│   │   └── style.css   # Main stylesheet
│   ├── js/
│   │   ├── utils.js    # Helper functions
│   │   ├── api.js      # Jikan API wrapper
│   │   ├── storage.js  # localStorage manager
│   │   ├── ui.js       # UI components
│   │   ├── anime.js    # Anime page logic
│   │   ├── player.js   # Watch page logic
│   │   ├── search.js   # Search page logic
│   │   ├── router.js   # Page routing
│   │   └── app.js      # Home page logic
│   ├── images/         # Image assets
│   ├── icons/          # PWA icons
│   └── fonts/          # Custom fonts
├── cloudflare/
│   ├── worker.js       # Edge worker
│   └── api.js          # API handlers
├── sw.js               # Service Worker
├── manifest.json       # PWA manifest
├── favicon.ico         # Site icon
├── wrangler.toml       # Cloudflare config
└── README.md           # This file
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `p` | Previous episode |
| `→` / `n` | Next episode |
| `f` | Toggle fullscreen |
| `t` | Toggle theater mode |
| `Ctrl/Cmd + K` | Open search |
| `Escape` | Close overlays |

## Anime IDs

To add anime to the platform, simply use any MyAnimeList anime ID:

```
anime.html?id=5114        # Fullmetal Alchemist: Brotherhood
anime.html?id=1535        # Death Note
anime.html?id=40748       # Jujutsu Kaisen
watch.html?id=1535&ep=1   # Watch Death Note Episode 1
```

## Disclaimer

This project is for educational purposes only. All anime data is fetched from the Jikan API (MyAnimeList). Streaming content is provided by third-party services. Please support official releases.

## License

MIT License - feel free to use and modify.
