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
  news: "News",
  realityTV: "Reality-TV",
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

const getSort = (sort) => (sort ? YTS_SORT[sort] : YTS_SORT.dateAdded);
const getOrder = (sort) => YTS_ORDER[sort];

/**
 * Check if the source is able to search with the given option
 * Cant search if:
 * - sorting is not supported
 * - genre is not supported
 */
const cantSearch = (sort, genre) =>
  (sort && !YTS_SORT[sort]) || (genre && !OUR_TO_YTS_GENRES[genre]);

/**
 * Search moovies on YTS and return axios reponse
 */
const ytsRawSearch = async ({ sort, query, minRating, year, genre }, page) =>
  axios.get(YTS_MOVIE_URL, {
    params: {
      limit: YTS_LIMIT,
      page,
      sort_by: getSort(sort),
      order_by: getOrder(sort),
      query_term:
        (query || "") + (query && year ? " " : "") + (year || "") || undefined,
      minimum_rating: minRating * 2 || undefined,
      genre: ourToYtsGenres(genre)
    }
  });

const getStart = (i) => i - YTS_LIMIT * Math.floor(i / YTS_LIMIT);

/**
 * Get at least YTS_LIMIT moovies starting from the index
 * If needed, make 2 request to get enough moovie
 */
const getMovies = async (options, index) => {
  const page = Math.floor(index / YTS_LIMIT) + 1;

  // Need one or two page (to get YTS_LIMIT movies)
  if (index % YTS_LIMIT) {
    const [{ data: data1 }, { data: data2 }] = await Promise.all([
      ytsRawSearch(options, page),
      ytsRawSearch(options, page + 1)
    ]);
    const start = getStart(index);

    if (data1 && data1.data.movies && data2 && data2.data.movies) {
      return [...data1.data.movies.slice(start), ...data2.data.movies];
    }

    return data1 && data1.data.movies.slice(start);
  }

  const { data } = await ytsRawSearch(options, page);
  return data && data.data.movies;
};

export const searchMoviesOnYts = async (options, index) => {
  // Checking if source can use this sorting method and this genre
  if (cantSearch(options.sort, options.genre)) {
    console.info("[yts]: Sort or genre not supported");
    return {
      name: "yts",
      nextPage: false,
      movies: []
    };
  }

  // Request to get movies corresponding to the search
  const rawMovies = await getMovies(options, index);

  if (!rawMovies) {
    console.info("[yts]: no movies found]");
    return {
      name: "yts",
      nextPage: false,
      movies: []
    };
  }

  // Formating the movie list
  const formatedMovies = rawMovies.map((movie) => ({
    id: movie.imdb_code,
    title: movie.title_english,
    cover: YTS_BASE_URL + movie.large_cover_image,
    year: movie.year,
    summary: movie.synopsis,
    genres: [
      ...new Set(movie.genres.map((ytsGenre) => YtsToOurGenres(ytsGenre)))
    ],
    rating: movie.rating / 2,
    runtime: movie.runtime,
    dateAdded:
      options.sort === "dateAdded" || !options.sort
        ? new Date(movie.date_uploaded_unix * 1000)
        : undefined
  }));

  return {
    name: "yts",
    nextPage:
      formatedMovies.length >=
      (index % YTS_LIMIT ? YTS_LIMIT - getStart(index) + YTS_LIMIT : YTS_LIMIT),
    movies: formatedMovies
  };
};

export default searchMoviesOnYts;
