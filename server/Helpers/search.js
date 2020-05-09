/* eslint-disable no-await-in-loop */
// Why disable no-await-in-loop ? Because I need the page before to get the next one, I can't parallelize this

import SearchCache from "../Schemas/SearchCache";
import yts from "./searchSources/yts";
import { searchMoviesOnRarbg } from "./searchSources/rarbg";
// import popCornTime from "./searchSources/popCornTime";
import UserHistoryModel from "../Schemas/UserHistory";

// const sourceList = [yts, popCornTime, rarbg];
const sourceList = [
  { name: "yts", func: yts },
  { name: "rarbg", func: searchMoviesOnRarbg }
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
 * Update cache
 */
const updateCache = async (
  allData,
  cacheDetails,
  indexes,
  resultMovies,
  searchOptions
) => {
  const recentCache = await SearchCache.findOne({
    searchType: searchOptions
  });

  // if page is not already cache, update it
  if (recentCache.cache.length === cacheDetails.cache.length) {
    // Adding indexes
    indexes.forEach((value, key) => {
      recentCache.indexes.set(key, value + (recentCache.indexes.get(key) || 0));
    });

    // Setting film who will no longer send result index's to -1
    allData.forEach((src) => {
      if (!src.movies.length && !src.nextPage) {
        recentCache.indexes.set(src.name, -1);
      }
    });

    // Caching movies
    if (resultMovies.length) {
      recentCache.cache.push(resultMovies);
    }

    await recentCache.save();
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

    await updateCache(
      allData,
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
  await updateCache(
    allData,
    cacheDetails,
    indexes,
    resultMovies,
    searchOptions
  );

  return resultMovies;
};

const getCache = async (searchOptions) => {
  const cacheDetails = await SearchCache.findOne({ searchType: searchOptions });

  if (!cacheDetails) {
    try {
      const newCacheDetails = await SearchCache.create({
        indexes: new Map(),
        cache: [],
        searchType: searchOptions
      });
      return newCacheDetails;
    } catch (e) {
      // if it's a duplicate error
      if (e.name === "MongoError" && e.code === 11000) {
        return SearchCache.findOne({ searchType: searchOptions });
      }
      throw e;
    }
  }

  return cacheDetails;
};

/**
 * page: page number [required]
 *
 * sort: The parameter on wich movies are gonna be sorted
 * query: search string
 * minRating: minimum note
 * year: specific year
 * genre: a specific movie genre
 */
const searchMoviesOnAllSource = async (searchOptions) => {
  // Get cache
  let cacheDetails = await getCache(searchOptions);

  // If wanted page is cache, return it
  if (cacheDetails.cache.length >= searchOptions.page) {
    return { movies: cacheDetails.cache[searchOptions.page - 1].toObject() };
  }

  // let moviesList;
  let allData;
  while (
    cacheDetails.cache.length < searchOptions.page &&
    (allData === undefined || allData.filter((src) => src.nextPage).length)
  ) {
    // Search on all sources
    allData = await Promise.all(
      // eslint-disable-next-line no-loop-func
      sourceList.map((src) =>
        src.func(searchOptions, cacheDetails.indexes.get(src.name) || 0)
      )
    );

    // Merging sources and caching
    await mergeMoviesList(
      allData,
      SORT_FUNC.get(searchOptions.sort || "dateAdded"),
      searchOptions,
      cacheDetails
    );

    // Getting updated cache
    cacheDetails = await getCache(searchOptions);
  }

  return {
    movies:
      cacheDetails.cache.length >= searchOptions.page
        ? cacheDetails.cache[searchOptions.page - 1].toObject()
        : []
  };
};

const checkIfViewed = async (data, userId) => {
  const history = await UserHistoryModel.find({ userId });
  const newData = data.movies.map((movie) => {
    const found = history.find((el) => el.imdb_code === movie.id);
    return {
      ...movie,
      viewed: !!found
    };
  });

  return { movies: newData };
};

export default { searchMoviesOnAllSource, checkIfViewed };
