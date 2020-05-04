import SearchCache from "../Schemas/SearchCache";
import yts from "./searchSources/yts";
import rarbg from "./searchSources/rarbg";
// import popCornTime from "./searchSources/popCornTime";

// const sourceList = [yts, popCornTime, rarbg];
const sourceList = [
  { name: "yts", func: yts },
  { name: "rarbg", func: rarbg }
];

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

/**
 * Create or update cache
 */
const manageCache = async (
  cacheDetails,
  indexes,
  resultMovies,
  searchOptions
) => {
  if (cacheDetails) {
    indexes.forEach((value, key) => {
      cacheDetails.indexes.set(
        key,
        value + (cacheDetails.indexes.get(key) || 0)
      );
    });
    cacheDetails.cache.push(resultMovies);
    await cacheDetails.save();
  } else {
    await SearchCache.create({
      indexes,
      cache: [resultMovies],
      searchType: searchOptions
    });
  }
};

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
const mergeMoviesList = async (
  allData,
  sortFunc,
  searchOptions,
  cacheDetails
) => {
  // Getting source with result
  const sources = allData.filter((src) => src.movies.length);

  // No result for all sources
  if (!sources.length) {
    return {
      nextPage: false,
      movies: []
    };
  }

  const idList = [];
  // Adding cache id to idList
  if (cacheDetails && cacheDetails.cache.length) {
    idList.push(
      ...cacheDetails.cache.flatMap((moviesLst) =>
        moviesLst.map((movie) => movie.id)
      )
    );
  }

  // Only one source has result -> No merge needed
  if (sources.length === 1) {
    // Removinf duplicate
    const resultMovies = sources[0].movies.filter(
      (movie) => !idList.includes(movie.id)
    );

    await manageCache(
      cacheDetails,
      new Map([[sources[0].name, sources[0].movies.length]]),
      resultMovies,
      searchOptions
    );

    return resultMovies;
  }

  // Mutlple source have result -> we must merge acording to sort
  const indexes = new Map(sources.map((source) => [source.name, 0]));
  const resultMovies = [];

  try {
    // While one source (with nextPage true) hasn't run out of movies OR all sources have run out of movies
    while (
      !sources.filter((src) => hasSourceEnded(indexes, src)).length &&
      sources.filter((src) => hasIndexReachEnd(indexes, src)).length !==
        sources.length
    ) {
      let bestMovie = null;
      let bestSource = null;

      // Searching for the best movie (in the first movie of each source)
      sources.forEach((source) => {
        if (!hasIndexReachEnd(indexes, source)) {
          let testedMovie = source.movies[indexes.get(source.name)];

          // Passing movie already in our final list
          while (idList.includes(testedMovie.id)) {
            indexes.set(source.name, indexes.get(source.name) + 1); // i++

            // One source with nextPage true has finished, we stop the merge by throwing an exception
            if (hasSourceEnded(indexes, source)) {
              throw new MergeError("One sources has no movies");
            }
            // One source with nextPage false has finished, we continue the merge, but this source will be ignore
            if (hasIndexReachEnd(indexes, source)) {
              return;
            }

            testedMovie = source.movies[indexes.get(source.name)];
          }

          // Testing for the best movie
          if (bestMovie === null || sortFunc(testedMovie, bestMovie)) {
            bestMovie = testedMovie;
            bestSource = source.name;
          }
        }
      });

      // Adding best movie to list
      if (bestMovie) {
        resultMovies.push(bestMovie);
        idList.push(bestMovie.id);
        indexes.set(bestSource, indexes.get(bestSource) + 1); // i++
      }
    }
  } catch (e) {
    // If it's not an error relative to sort, we throw it, else we continue
    if (!(e instanceof MergeError)) {
      throw e;
    }
  }

  // Completing or creating cache
  await manageCache(cacheDetails, indexes, resultMovies, searchOptions);

  return resultMovies;
};

/**
 * sort: The parameter on wich movies are gonna be sorted
 * query: search string
 * page: page number
 *
 * minRating: minimum note
 * year: specific year
 * genre: a specific movie genre
 */
const searchMoviesOnAllSource = async (searchOptions) => {
  // Get cache
  const cacheDetails = await SearchCache.findOne({ searchType: searchOptions });

  // If wanted page is cache, return it
  if (cacheDetails && cacheDetails.cache.length >= (searchOptions.page || 1)) {
    return { movies: cacheDetails.cache[(searchOptions.page || 1) - 1] };
  }

  // Search on all sources
  const allData = await Promise.all(
    sourceList.map((src) =>
      src.func(
        searchOptions,
        (cacheDetails && cacheDetails.indexes.get(src.name)) || 0
      )
    )
  );

  // Merging sources and caching
  const moviesList = await mergeMoviesList(
    allData,
    SORT_FUNC.get(searchOptions.sort || "dateAdded"),
    searchOptions,
    cacheDetails
  );

  return { movies: moviesList };
};

export default searchMoviesOnAllSource;
