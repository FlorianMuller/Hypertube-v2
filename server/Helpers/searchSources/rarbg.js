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
export const waitDecorator = (func) => async (...params) => {
  const timeSinceLastCall = Date.now() - lastCall;

  if (lastCall && timeSinceLastCall < 2000) {
    // Need to wait before call to api
    lastCall = Date.now() + 2000 - timeSinceLastCall;
    await timeout(2000 - timeSinceLastCall);
  } else {
    lastCall = Date.now();
  }

  const ret = await func(...params);
  return ret;
};

/**
 * Return a rarbg token to call its api
 */
// @waitDecorator
export const getRarbgToken = waitDecorator(async () => {
  const {
    data: { token }
  } = await axios.get(RARBG_URL, {
    params: {
      get_token: "get_token",
      app_id: "Hypertube"
    }
  });

  return token;
});

/**
 * Search movies with the rar
 */
// @waitDecorator
const search = waitDecorator(async (options) =>
  axios.get(RARBG_URL, {
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
  })
);

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
 * (in case of duplicate -> take the first one)
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
 * - a genre is wanted
 */
const cantSearch = (options, index) => {
  return (
    (options.sort && !RARBG_SORT[options.sort]) ||
    options.minRating ||
    index === -1 ||
    options.year ||
    options.genre
  );
};

export const searchMoviesOnRarbg = async (options, index) => {
  // Check if we can make this search with Rarbg
  if (cantSearch(options, index)) {
    console.info("[rarbg] search not supported");
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
    console.info("[rargb] no movies found", data);
    return { ...defautlResponse };
  }

  // Removing duplicate and movies without IMDb id + slicing already viewed moovies
  const movies = cleanMovies(data.torrent_results).slice(index);

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
    genres: movie.genres && [
      ...new Set(movie.genres.map((genre) => TmdbToOurGenre(genre.name)))
    ],
    rating: (movie.vote_count > 0 && movie.vote_average / 2) || null,
    runtime: movie.runtime,
    dateAdded:
      options.sort === "dateAdded" || !options.sort
        ? new Date(movies[i].pubdate)
        : undefined,
    seeds: options.sort === "seeds" ? movies[i].seeders : undefined
  }));

  return {
    name: "rarbg",
    nextPage: false, // send max directly
    movies: formatedMovies
  };
};
