const params = new URLSearchParams(window.location.search);

const animeId = params.get('id');

const animeInfo = document.getElementById('animeInfo');
const videoPlayer = document.getElementById('videoPlayer');
const episodesContainer = document.getElementById('episodes');

async function loadAnime() {

  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}`
  );

  const data = await response.json();

  const anime = data.data;

  animeInfo.innerHTML = `
    <h1>${anime.title}</h1>

    <p>${anime.synopsis || 'No synopsis available.'}</p>
  `;

  loadEpisodes(animeId);
}

async function loadEpisodes(id) {

  const response = await fetch('./data/embeds.json');

  const data = await response.json();

  const animeEpisodes = data[id];

  if(!animeEpisodes) {

    episodesContainer.innerHTML =
      '<p>No episodes added yet.</p>';

    return;
  }

  animeEpisodes.forEach(ep => {

    const btn = document.createElement('button');

    btn.classList.add('episode-btn');

    btn.innerText = `Episode ${ep.episode}`;

    btn.addEventListener('click', () => {
      videoPlayer.src = ep.embed;
    });

    episodesContainer.appendChild(btn);
  });

  videoPlayer.src = animeEpisodes[0].embed;
}

loadAnime();
