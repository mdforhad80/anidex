const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const player =
document.getElementById("videoPlayer");

const episodeList =
document.getElementById("episodeList");

async function loadAnime(){

  const res = await fetch(
    `https://api.jikan.moe/v4/anime/${id}`
  );

  const data = await res.json();

  const anime = data.data;

  document.getElementById(
    "animePoster"
  ).src =
  anime.images.jpg.large_image_url;

  document.getElementById(
    "animeTitle"
  ).textContent =
  anime.title;

  document.getElementById(
    "animeSynopsis"
  ).textContent =
  anime.synopsis;

  document.getElementById(
    "animeScore"
  ).textContent =
  `⭐ ${anime.score}`;

  document.getElementById(
    "animeEpisodes"
  ).textContent =
  `Episodes: ${anime.episodes}`;

  document.getElementById(
    "animeStatus"
  ).textContent =
  anime.status;

}

async function loadEpisodes(){

  const res = await fetch(
    "data/embeds.json"
  );

  const embeds = await res.json();

  const animeEpisodes = embeds[id];

  if(!animeEpisodes) return;

  player.src = animeEpisodes[0].embed;

  animeEpisodes.forEach(ep => {

    const btn =
    document.createElement("button");

    btn.classList.add("episode-btn");

    btn.textContent =
    ep.episode;

    btn.onclick = () => {

      player.src = ep.embed;

    };

    episodeList.appendChild(btn);

  });

}

async function loadTrendingSidebar(){

  const res = await fetch(
    "https://api.jikan.moe/v4/top/anime"
  );

  const data = await res.json();

  const container =
  document.getElementById(
    "trendingSidebar"
  );

  data.data.slice(0,8).forEach(anime => {

    const item =
    document.createElement("div");

    item.classList.add(
      "trending-item"
    );

    item.innerHTML = `
      <img src="${anime.images.jpg.image_url}">

      <div>
        <h4>${anime.title}</h4>
        <p>⭐ ${anime.score}</p>
      </div>
    `;

    item.onclick = () => {

      window.location.href =
      `watch.html?id=${anime.mal_id}`;

    };

    container.appendChild(item);

  });

}

loadAnime();
loadEpisodes();
loadTrendingSidebar();
