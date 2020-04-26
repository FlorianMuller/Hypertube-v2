import axios from "axios";
import qs from "qs";

const POPCORN_URL = "https://tv-v2.api-fetch.website/movies";

export const searchShowsOnPCT = async ({ query, page, collections }) => {
  const queryParams = qs.stringify({
    genre: collections,
    keywords: query,
    // sort: "trending"
    sort: "title",
    order: 1
  });
  const { data } = await axios.get(
    `${POPCORN_URL}/${page || 1}?${queryParams}`
  );

  const parsedShows =
    (data &&
      data.map((movie) => ({
        id: movie.imdb_id,
        title: movie.title,
        cover: movie.images.poster,
        year: movie.year,
        summary: movie.synopsis,
        genres: movie.genre,
        rating: movie.rating.percentage / 20,
        runtime: movie.runtime
      }))) ||
    [];

  return {
    name: "popCornTime",
    nextPage: parsedShows.length === 50,
    movies: parsedShows
  };
};

export default searchShowsOnPCT;
