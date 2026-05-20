// ============================================
// CLOUDFLARE WORKER - API Proxy & Caching
// ============================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cache = caches.default;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Cache key
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (response) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: { ...response.headers, ...corsHeaders }
      });
    }

    // Proxy to Jikan API
    if (url.pathname.startsWith('/api/')) {
      const jikanUrl = `https://api.jikan.moe/v4${url.pathname.replace('/api', '')}${url.search}`;

      response = await fetch(jikanUrl, {
        method: request.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AnimeStream-Worker/1.0'
        }
      });

      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });

      ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));
      return newResponse;
    }

    // Static assets - serve from cache or fetch
    response = await fetch(request);

    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        ...corsHeaders
      }
    });

    return newResponse;
  }
};
