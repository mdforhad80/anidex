const animeGrid = document.getElementById("animeGrid");
const latestGrid = document.getElementById("latestGrid");

async function fetchTrendingAnime() {

  const res = await fetch(
    "https://api.jikan.moe/v4/top/anime"
  );

  const data = await res.json();

  displayAnime(data.data, animeGrid);

}

async function fetchLatestAnime() {

  const res = await fetch(
    "https://api.jikan.moe/v4/seasons/now"
  );

  const data = await res.json();

  displayAnime(data.data, latestGrid);

}

function displayAnime(animeList, container){

  container.innerHTML = "";

  animeList.slice(0,12).forEach(anime => {

    const card = document.createElement("div");

    card.classList.add("card");

    card.innerHTML = `
      <img src="${anime.images.jpg.large_image_url}">

      <div class="card-content">

        <h3>${anime.title}</h3>

        <p>
          ⭐ ${anime.score || "N/A"}
        </p>

      </div>
    `;

    card.addEventListener("click", () => {

      window.location.href =
      `anime.html?id=${anime.mal_id}`;

    });

    container.appendChild(card);

  });

}

fetchTrendingAnime();
fetchLatestAnime();
