const animeGrid = document.getElementById('animeGrid');
const searchInput = document.getElementById('searchInput');

async function fetchTrendingAnime() {

  try {

    animeGrid.innerHTML = "<p>Loading anime...</p>";

    const response = await fetch(
      'https://api.jikan.moe/v4/top/anime'
    );

    const result = await response.json();

    displayAnime(result.data);

  } catch (error) {

    console.log(error);

    animeGrid.innerHTML =
      "<p>Failed to load anime.</p>";
  }
}

function displayAnime(animes) {

  animeGrid.innerHTML = '';

  animes.slice(0, 12).forEach(anime => {

    const card = document.createElement('div');

    card.classList.add('card');

    card.innerHTML = `
      <img src="${anime.images.jpg.large_image_url}" />

      <div class="card-content">

        <h3>${anime.title}</h3>

        <div class="meta">
          ⭐ ${anime.score || 'N/A'}
        </div>

      </div>
    `;

    card.addEventListener('click', () => {

      window.location.href =
      `anime.html?id=${anime.mal_id}`;

    });

    animeGrid.appendChild(card);
  });
}

searchInput.addEventListener('keyup', async () => {

  const query = searchInput.value;

  if(query.length < 3) {
    fetchTrendingAnime();
    return;
  }

  try {

    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${query}`
    );

    const result = await response.json();

    displayAnime(result.data);

  } catch(error) {

    console.log(error);
  }
});

fetchTrendingAnime();
