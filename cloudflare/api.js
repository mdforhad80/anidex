// ============================================
// CLOUDFLARE API - Edge Functions
// ============================================

// Helper to create JSON response
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Helper to proxy Jikan API
async function proxyJikan(path, searchParams) {
  const url = `https://api.jikan.moe/v4${path}?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AnimeStream-Worker/1.0'
    }
  });
  return response;
}

// Edge function handlers
export const handlers = {
  // Search anime
  async search(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '24';

    const params = new URLSearchParams({ q: query, page, limit });
    const response = await proxyJikan('/anime', params);
    return response;
  },

  // Get anime by ID
  async getAnime(request, id) {
    const response = await proxyJikan(`/anime/${id}/full`, new URLSearchParams());
    return response;
  },

  // Get top anime
  async getTopAnime(request) {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '24';
    const filter = url.searchParams.get('filter') || '';

    const params = new URLSearchParams({ page, limit });
    if (filter) params.append('filter', filter);

    const response = await proxyJikan('/top/anime', params);
    return response;
  },

  // Get seasonal anime
  async getSeasonal(request) {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const season = url.searchParams.get('season');
    const page = url.searchParams.get('page') || '1';

    let path;
    if (year && season) {
      path = `/seasons/${year}/${season}`;
    } else {
      path = '/seasons/now';
    }

    const params = new URLSearchParams({ page, limit: '24' });
    const response = await proxyJikan(path, params);
    return response;
  },

  // Get schedule
  async getSchedule(request) {
    const url = new URL(request.url);
    const day = url.searchParams.get('day') || '';
    const params = new URLSearchParams({ limit: '24' });
    if (day) params.append('filter', day);

    const response = await proxyJikan('/schedules', params);
    return response;
  },

  // Get upcoming
  async getUpcoming(request) {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const params = new URLSearchParams({ page, limit: '24' });
    const response = await proxyJikan('/seasons/upcoming', params);
    return response;
  }
};
