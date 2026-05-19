const animeGrid = document.getElementById('animeGrid');
}

function displayAnime(animes) {

  animeGrid.innerHTML = '';

  animes.forEach(anime => {

    const card = document.createElement('div');

    card.classList.add('card');

    card.innerHTML = `
      <img src="${anime.images.jpg.large_image_url}">

      <div class="card-content">
        <h3>${anime.title}</h3>

        <div class="meta">
          Score: ${anime.score || 'N/A'}
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

  const response = await fetch(
    `https://api.jikan.moe/v4/anime?q=${query}`
  );

  const data = await response.json();

  displayAnime(data.data);

});

fetchTrendingAnime();
