import axios from "axios";
import _ from "lodash";

const YTS_BASE_URL = "https://yts.ae";
const YTS_MOVIE_URL = `${YTS_BASE_URL}/api/v2/list_movies.json`;

const YTS_LIMIT = 50;

// our category -> YTS category
const OUR_TO_YTS_GENRES = {
  action: "Action",
  adventure: "Adventure",
  animation: "Animation",
  biography: "Biography",
  comedy: "Comedy",
  crime: "Crime",
  documentary: "Documentary",
  drama: "Drama",
  family: "Family",
  fantasy: "Fantasy",
  filmNoir: "Film-Noir",
  history: "History",
  horror: "Horror",
  music: "Music",
  musical: "Musical",
  mystery: "Mystery",
  romance: "Romance",
  sciFi: "Sci-Fi",
  // shortFilm: "Short Film", // didn't found it on YTS but it's an IMDb official genre 🤷🏻‍♂️
  sport: "Sport",
  superhero: "Superhero",
  thriller: "Thriller",
  war: "War",
  western: "Western"
};
const YTS_TO_OUR_GENRES = _.invert(OUR_TO_YTS_GENRES);

const YTS_SORT = {
  dateAdded: "date_added",
  // seeds: "seeds",
  title: "title",
  year: "year",
  rating: "rating"
};

const YTS_ORDER = {
  dateAdded: "des",
  // seeds: "des",
  title: "asc",
  year: "des",
  rating: "des"
};

const ourToYtsGenres = (genre) => OUR_TO_YTS_GENRES[genre];
const YtsToOurGenres = (genre) => YTS_TO_OUR_GENRES[genre];

const getSort = (sort) => (sort ? YTS_SORT[sort] : "date_added");
const getOrder = (sort) => YTS_ORDER[sort];

/**
 * Check if the source is able to search with the given option
 * Cant search if:
 * - sorting is not supported
 * - collection is not supported
 */
const cantSearch = (sort, collection) => {
  return (
    (sort && !YTS_SORT[sort]) || (collection && !OUR_TO_YTS_GENRES[collection])
  );
};

export const searchMoviesOnYts = async ({
  sort,
  query,
  page,
  minRating,
  year,
  collection
}) => {
  // Checking if source can use this sorting method and this collection
  if (cantSearch(sort, collection)) {
    console.warn("[YTS]: Sort or collection not supported");
    return {
      name: "yts",
      nextPage: false,
      movies: []
    };
  }

  // Request to get movies corresponding to the search
  const { data } = await axios.get(YTS_MOVIE_URL, {
    params: {
      limit: 50,
      sort_by: getSort(sort),
      order_by: getOrder(sort),
      query_term: (query || "") + (query && year ? " " : "") + (year || ""),
      page,
      minimum_rating: minRating * 2 || 0,
      genre: ourToYtsGenres(collection)
    }
  });

  // Checking `movies` because sometime `data.data.movie_count` is positive and there's no `movies` (wtf)
  if (!data || !data.data.movies) {
    console.warn("[YTS]: no result]");
    return {
      name: "yts",
      nextPage: false,
      movies: []
    };
  }

  // Formating the movie list
  const formatedMovies = data.data.movies.map((movie) => ({
    id: movie.imdb_code,
    title: movie.title_english,
    cover: YTS_BASE_URL + movie.large_cover_image,
    year: movie.year,
    summary: movie.synopsis,
    genres: movie.genres.map((genre) => YtsToOurGenres(genre)),
    rating: movie.rating / 2,
    runtime: movie.runtime
  }));

  return {
    name: "yts",
    nextPage: formatedMovies.length === YTS_LIMIT,
    movies: formatedMovies
  };
};

export default searchMoviesOnYts;
