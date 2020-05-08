import mongoose from "../mongo";

const searchedMoviesSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    cover: String,
    year: String,
    summary: String,
    genres: [String],
    rating: String,
    runtime: String,
    dateAdded: String,
    seeds: String
  },
  { _id: false }
);

const searchTypeSchema = new mongoose.Schema(
  {
    sort: String,
    query: String,
    minRating: Number,
    year: Number,
    genre: String
  },
  { _id: false }
);

const searchCacheSchema = new mongoose.Schema({
  indexes: { type: Map, required: true },
  cache: { type: [[searchedMoviesSchema]], required: true },
  searchType: {
    type: searchTypeSchema,
    required: true,
    unique: true
  },
  createdAt: { type: Date, default: () => Date.now() }
});

const SearchCache = mongoose.model("SearchCache", searchCacheSchema);

export default SearchCache;
