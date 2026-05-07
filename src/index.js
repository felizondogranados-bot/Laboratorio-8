const PLACEHOLDER_IMAGE = "https://placehold.co/210x295";

const $header = document.querySelector("header");

const $episodes = document.querySelector(".episodes");

const $searchInput = document.querySelector("#searchInput");

const $searchButton = document.querySelector("#searchButton");

/* ======================================
   BUSCAR SERIE
====================================== */

const searchShow = async (query) => {

    const URL = `https://api.tvmaze.com/search/shows?q=${query}`;

    const response = await fetch(URL);

    const data = await response.json();

    if(data.length === 0){

        alert("Serie no encontrada");

        return null;
    }

    return data[0].show;
};

/* ======================================
   OBTENER DATOS
====================================== */

const getShowData = async (id) => {

    const URL = `https://api.tvmaze.com/shows/${id}`;

    const response = await fetch(URL);

    const data = await response.json();

    return {

        name: data.name,

        rating: data.rating.average,

        image: data.image?.medium ?? PLACEHOLDER_IMAGE
    };
};

/* ======================================
   OBTENER EPISODIOS
====================================== */

const getEpisodeList = async (id) => {

    const URL = `https://api.tvmaze.com/shows/${id}/episodes`;

    const response = await fetch(URL);

    const episodeList = await response.json();

    const grouped = {};

    episodeList.forEach((episode) => {

        if(!grouped[episode.season]){

            grouped[episode.season] = [];
        }

        grouped[episode.season].push({

            number: episode.number,

            rating: Math.floor(
                episode.rating.average || 0
            )
        });

    });

    return grouped;
};

/* ======================================
   RENDER HEADER
====================================== */

const renderHeader = (show) => {

    $header.innerHTML = `

        <img
            class="poster"
            src="${show.image}"
            alt="${show.name}"
        >

        <h1>${show.name}</h1>

        <div class="rating-container">

            ⭐ ${show.rating}

        </div>
    `;
};

/* ======================================
   CREAR EPISODIO
====================================== */

const createEpisodeHTML = (episode) => {

    return `

        <div class="episode rating-${episode.rating}">

            ${episode.number}

        </div>
    `;
};

/* ======================================
   CREAR TEMPORADA
====================================== */

const createSeasonHTML = (data, number) => {

    const episodeList = data
        .map(createEpisodeHTML)
        .join("");

    return `

        <article class="season">

            <header class="season-header">

                T${number}

            </header>

            ${episodeList}

        </article>
    `;
};

/* ======================================
   RENDER EPISODIOS
====================================== */

const renderEpisodes = (seasons) => {

    const seasonList = Object.values(seasons)
        .map((season, index) => {

            return createSeasonHTML(
                season,
                index + 1
            );
        });

    $episodes.innerHTML = seasonList.join("");
};

/* ======================================
   CARGAR SERIE
====================================== */

const loadShow = async (query) => {

    const showResult = await searchShow(query);

    if(!showResult){
        return;
    }

    const show = await getShowData(showResult.id);

    const seasons = await getEpisodeList(showResult.id);

    renderHeader(show);

    renderEpisodes(seasons);
};

/* ======================================
   EVENTO BOTON
====================================== */

$searchButton.addEventListener("click", () => {

    const query = $searchInput.value.trim();

    if(query === ""){
        return;
    }

    loadShow(query);
});

/* ======================================
   ENTER PARA BUSCAR
====================================== */

$searchInput.addEventListener("keypress", (event) => {

    if(event.key === "Enter"){

        $searchButton.click();
    }
});

/* ======================================
   SERIE INICIAL
====================================== */

loadShow("Stranger Things");