import yts from "./searchSources/yts";
import rarbg from "./searchSources/rarbg";
// import popCornTime from "./searchSources/popCornTime";

// const sourceList = [yts, popCornTime, rarbg];
const sourceList = [yts, rarbg];

/**
 * List of function used to sort movies of different source
 * Return `true` if `tested` is better than `best`
 */
const SORT_FUNC = new Map([
  ["dateAdded", (tested, best) => tested.dateAdded > best.dateAdded],
  ["seeds", (tested, best) => tested.seeds > best.seeds],
  [
    "title",
    (tested, best) =>
      best.localeCompare(tested, "en", { sensitivity: "base", numeric: true })
  ],
  ["year", (tested, best) => tested.year > best.year],
  ["rating", (tested, best) => tested.rating > best.year]
]);

/**
 * Custom error (exception) for the mergeMoviesList function
 */
class MergeError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MergeError);
    }

    this.name = "MergeError";
  }
}

const hasSourceEnded = (indexes, src) =>
  indexes.get(src.name) === src.movies.length && src.nextPage;

const hasIndexReachEnd = (indexes, src) =>
  indexes.get(src.name) === src.movies.length;

/**
 * Take search on all sources and merge them according to the given sort
 *
 * ~ Stop merge when a source with nextPage true has run out
 * of movies OR when all source have run out of movies
 * (nextPage true because if nextPage is false, no other movies will come
 * from this source, therefore we can add movies after this source has ended)
 *
 * ~ Return between n and (n * 50 - (n - 1)) movies
 * (with n the number of sources)
 *
 * transformation:
 * [{ nextPage: bool, movies: [] }, { nextPage: bool, movies: [] }, ...]  ->  {nextPage: bool, movies: []}
 */
const mergeMoviesList = async (allData, sortFunc) => {
  const sources = allData.filter((src) => src.movies.length);

  // No result for all sources
  if (!sources.length) {
    return {
      nextPage: false,
      movies: []
    };
  }

  // todo: get old movies from cache and remove duplicate

  // Only one source has result -> No nerge needed
  if (sources.length === 1) {
    return {
      nextPage: sources[0].nextPage,
      movies: sources[0].movies
    };
  }

  // Mutlple source have result -> we must merge acording to sort
  // todo: get indexes from cache
  const indexes = new Map(sources.map((source) => [source.name, 0]));
  // console.log("indexes", indexes);

  const finalMovies = [];
  const idList = [];

  try {
    // While one source (with nextPage true) hasn't run out of movies OR all sources have run out of movies
    while (
      !sources.filter((src) => hasSourceEnded(indexes, src)).length &&
      sources.filter((src) => hasIndexReachEnd(indexes, src)).length !==
        sources.length
    ) {
      let bestMovie = null;
      let bestSource = null;
      // console.log(
      //   "gona compare: ",
      //   sources.map((source) => source.movies[indexes.get(source.name)])
      // );

      // Searching for the best movie (in the first movie of each source)
      sources.forEach((source) => {
        if (!hasIndexReachEnd(indexes, source)) {
          let testedMovie = source.movies[indexes.get(source.name)];

          // Getting next movie from source until the movie is already in finalMovies (or source run out of movie)
          while (idList.includes(testedMovie.id)) {
            indexes.set(source.name, indexes.get(source.name) + 1); // i++
            // One source with nextPage true has finished, we stop the merge by throwing an exception
            if (hasSourceEnded(indexes, source)) {
              throw new MergeError("One sources has no movies");
            }
            // One source with nextPage false has finished, we continue the sort, but this source will be ignore
            if (hasIndexReachEnd(indexes, source)) {
              return;
            }
            testedMovie = source.movies[indexes.get(source.name)];
          }

          if (bestMovie === null || sortFunc(testedMovie, bestMovie)) {
            bestMovie = testedMovie;
            bestSource = source.name;
          }
        }
      });
      // console.log(`${bestSource} won with ${bestMovie && bestMovie.title}\n\n`);

      // Adding best movie to list
      finalMovies.push(bestMovie);
      idList.push(bestMovie.id);
      indexes.set(bestSource, indexes.get(bestSource) + 1); // i++
    }
  } catch (e) {
    // If it's not an error relative to sort, we throw it, else we continue
    if (!(e instanceof MergeError)) {
      throw e;
    }
  }

  // todo: Cache indexes + result

  // console.log("indexes", indexes);
  return {
    nextPage: !!allData.filter((source) => source.nextPage).length,
    movies: finalMovies
  };
};

/**
 * sort: The parameter on wich movies are gonna be sorted
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

  const moviesList = await mergeMoviesList(
    allData,
    SORT_FUNC.get(searchParam.sort || "dateAdded")
  );

  return moviesList;
};

export default searchMoviesOnAllSource;
