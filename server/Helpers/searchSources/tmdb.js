import axios from "axios";
import _ from "lodash";

const TMDN_URL = "https://api.themoviedb.org/3";
export const IMAGE_URL = "http://image.tmdb.org/t/p";

// our genres -> TMDB genres
const OUR_TO_TMDB_GENRES = {
  action: "Action",
  adventure: "Adventure",
  animation: "Animation",
  comedy: "Comedy",
  crime: "Crime",
  documentary: "Documentary",
  drama: "Drama",
  family: "Family",
  fantasy: "Fantasy",
  history: "History",
  horror: "Horror",
  music: "Music",
  mystery: "Mystery",
  romance: "Romance",
  sciFi: "Science Fiction",
  tvMovie: "TV Movie",
  thriller: "Thriller",
  war: "War",
  western: "Western"
};
// TMDB genres -> our genres
const TMDB_TO_OUR_GENRES = _.invert(OUR_TO_TMDB_GENRES);

export const ourToTmdbGenre = (genre) => OUR_TO_TMDB_GENRES[genre];
export const TmdbToOurGenre = (genre) => TMDB_TO_OUR_GENRES[genre];

export const getMovieInfoFromTmdb = async (id) => {
  try {
    const { data } = await axios.get(`${TMDN_URL}/movie/${id}`, {
      params: {
        api_key: process.env.TMDB_API_KEY_V3
      }
    });
    return data;
  } catch (e) {
    // Movie requested could not be found
    if (e.response && e.response.data && e.response.data.status_code === 34) {
      return {};
    }
    throw e;
  }
};

export default getMovieInfoFromTmdb;
