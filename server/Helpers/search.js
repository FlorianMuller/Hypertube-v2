import yts from "./searchSources/yts";
import rarbg from "./searchSources/rarbg";
// import popCornTime from "./searchSources/popCornTime";

// const sourceList = [yts, popCornTime, rarbg];
const sourceList = [yts, rarbg];

// [{ nextPage: bool, movies: [] }, { nextPage: bool, movies: [] }, ...] -> {nextPage: bool, movies: []}
const mergeMoviesList = async (allData) => {
  const idList = [];
  return {
    nextPage: !!allData.filter((data) => data.nextPage).length,
    movies: allData
      .flatMap((data) => data.movies)
      .filter((movie) => {
        return !idList.includes(movie.id) && idList.push(movie.id);
      })
  };
};

/**
 * sort: sorting method
 * query: search string
 * page: page number
 *
 * minRating: minimum note
 * year: specific year
 * collection: a specific movie genre
 */
const searchMoviesOnAllSource = async (searchParam) => {
  const allData = await Promise.all(
    sourceList.map((func) => func(searchParam))
  );

  const moviesList = await mergeMoviesList(allData);
  // console.log(moviesList);

  return moviesList;
};

export default searchMoviesOnAllSource;
