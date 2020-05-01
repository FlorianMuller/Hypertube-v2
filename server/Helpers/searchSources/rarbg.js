import axios from "axios";
import util from "util";
import { getMovieInfoFromTmdb, TmdbToOurGenre, IMAGE_URL } from "./tmdb";

/**
 * RARGB api source
 * doc: https://torrentapi.org/apidocs_v2.txt?&app_id=rarbg-rubygem
 */

const RARBG_URL = "https://torrentapi.org/pubapi_v2.php";
let RARBG_TOKEN = null;
let lastCall = null;

const RARBG_SORT = {
  dateAdded: "last",
  seeds: "seeders"
};

const defautlResponse = {
  name: "rarbg",
  nextPage: false,
  movies: []
};

// if sort === undefined, the sort will be "last"
const getSort = (sort) => RARBG_SORT[sort];

/**
 * setTimeout with Promises
 */
const timeout = util.promisify(setTimeout);

/**
 * Make sure one second has passed between each call to
 * the rarbg's api
 */
const waitDecorator = (func) => async (...params) => {
  const timeSinceLastCall = Date.now() - lastCall;

  if (!lastCall || timeSinceLastCall > 1000) {
    console.log("[rarbg] calling yts api NOW");
    const ret = await func(...params);
    lastCall = Date.now();
    return ret;
  }

  // Need to wait before call to api
  console.log("[rarbg] calling yts api", 1000 - timeSinceLastCall);
  await timeout(1000 - timeSinceLastCall);

  const ret = await func(...params);
  lastCall = Date.now();
  return ret;
};

/**
 * Return a rarbg token to call its api
 */
// @waitDecorator
const getRarbgToken = waitDecorator(async () => {
  const {
    data: { token }
  } = await axios.get(RARBG_URL, {
    params: {
      get_token: "get_token",
      app_id: "Hypertube"
    }
  });
  console.log(`[rarbg]: got Token ${token}`);

  return token;
});

/**
 * Search movies with the rar
 */
// @waitDecorator
const search = waitDecorator(async (options) => {
  console.log(`[rarbg]: searching (${RARBG_TOKEN})`);

  return axios.get(RARBG_URL, {
    params: {
      token: RARBG_TOKEN,
      app_id: "Hypertube",
      mode: "search",
      format: "json_extended",
      limit: "100",
      category: "movies",
      sort: getSort(options.sort),
      search_string: options.query
    }
  });
});

/**
 * Try to search on Rarbg, if needed, ask for a token
 */
const safeSearch = async (options) => {
  const { data } = await search(options);
  if (!data.error) return data;

  // Api need a token
  if ([1, 2, 4].includes(data.error_code)) {
    RARBG_TOKEN = await getRarbgToken();
    const { data: newData } = await search(options);
    return newData;
  }

  // Other error
  return data;
};

/**
 * Remove duplicate and movies without IMDb id
 */
const cleanMovies = (movies) => {
  const idList = [];
  return movies.filter(
    (movie) =>
      movie.episode_info &&
      movie.episode_info.imdb &&
      !idList.includes(movie.episode_info.imdb) &&
      idList.push(movie.episode_info.imdb)
  );
};

/**
 * Check if the source is able to search with the given options
 * Cant search if:
 * - sorting is not supported
 * - page granter than 2 is wanted
 * - a minimal rating is wanted
 * - a year is wanted
 * - a collection is wanted
 */
const cantSearch = (options) => {
  return (
    (options.sort && !RARBG_SORT[options.sort]) ||
    options.minRating ||
    options.page > 2 ||
    options.year ||
    options.collection
  );
};

const searchMoviesOnRarbg = async (options) => {
  // Check if we can make this search with Rarbg
  if (cantSearch(options)) {
    console.warn("[rarbg] search not supported");
    return { ...defautlResponse };
  }

  // Set token if needed
  if (RARBG_TOKEN === null) {
    RARBG_TOKEN = await getRarbgToken();
  }

  // Getting movies from rargb
  const data = await safeSearch(options);

  // No movies found / Error
  if (!data.torrent_results) {
    console.warn("[rargb] no found movies", data);
    return { ...defautlResponse };
  }

  // Removing duplicate and movies without IMDb id
  let movies = cleanMovies(data.torrent_results);

  // Fake paging (there's no page system in the api, it can only return 100 elements max)
  if (options.page > 1) {
    movies = movies.slice(50, movies.length);
  } else {
    movies = movies.slice(0, 50);
  }

  // Getting more info about all movies with TMDb
  const moviesData = await Promise.all(
    movies.map((movie) => getMovieInfoFromTmdb(movie.episode_info.imdb))
  );

  // Formating movies
  const formatedMovies = moviesData.map((movie, i) => ({
    id: movies[i].episode_info.imdb,
    title:
      movie.title ||
      movie.original_title ||
      movies[i].title.replace(/\./g, " "),
    cover: movie.poster_path && `${IMAGE_URL}/w300${movie.poster_path}`,
    year: movie.release_date && movie.release_date.split("-")[0],
    summary: movie.overview,
    genres:
      movie.genres && movie.genres.map((genre) => TmdbToOurGenre(genre.name)),
    rating: (movie.vote_count > 0 && movie.vote_average / 2) || null,
    runtime: movie.runtime
  }));

  return {
    name: "rarbg",
    nextPage: options.page === 1 && formatedMovies.length >= 50, // max 2 page
    movies: formatedMovies
  };
};

export default searchMoviesOnRarbg;