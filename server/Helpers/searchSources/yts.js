import axios from "axios";

const YTS_BASE_URL = "https://yts.ae";
const YTS_MOVIE_URL = `${YTS_BASE_URL}/api/v2/list_movies.json`;

// our category -> YTS category
const YTS_COLLECTION = {
  action: "Action",
  adventure: "Adventure",
  animation: "Animation",
  aiography: "Biography",
  aomedy: "Comedy",
  arime: "Crime",
  documentary: "Documentary",
  drama: "Drama",
  family: "Family",
  fantasy: "Fantasy",
  filmNoir: "Film Noir",
  history: "History",
  horror: "Horror",
  music: "Music",
  musical: "Musical",
  mystery: "Mystery",
  romance: "Romance",
  sciFi: "Sci-Fi",
  shortFilm: "Short Film",
  sport: "Sport",
  superhero: "Superhero",
  thriller: "Thriller",
  war: "War",
  western: "Western"
};

const YTS_SORT = {
  seeds: "seeds",
  date_added: "date_added",
  title: "title",
  year: "year",
  rating: "rating"
};

const getCollection = (cat) => {
  return cat ? YTS_COLLECTION[cat] : undefined;
};

const getSort = (sort) => {
  return sort ? YTS_SORT[sort] : "date_added";
};

export const searchMoviesOnYts = async ({
  sort,
  order,
  query,
  page,
  minRating,
  year,
  collection
}) => {
  // Checking if source can use this sorting method and this collection
  if (
    (sort && !YTS_SORT[sort]) ||
    (collection && !YTS_COLLECTION[collection])
  ) {
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
      order_by: order,
      query_term: (query || "") + (query && year ? " " : "") + (year || ""),
      page,
      minimum_rating: minRating * 2 || 0,
      genre: getCollection(collection)
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
  const parsedMovies = data.data.movies.map((movie) => ({
    id: movie.imdb_code,
    title: movie.title_english,
    cover: YTS_BASE_URL + movie.large_cover_image,
    year: movie.year,
    summary: movie.synopsis,
    genres: movie.genres,
    rating: movie.rating / 2,
    runtime: movie.runtime
  }));

  return {
    name: "yts",
    nextPage: parsedMovies.length === 12,
    movies: parsedMovies
  };
};

export default searchMoviesOnYts;
